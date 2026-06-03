import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { TestCasesTable, repositories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { Browserbase } from "@browserbasehq/sdk";
import { chromium } from "playwright-core";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "placeholder-key",
});

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY || process.env.BROWSERBASE_BROWSERKEY || "placeholder-key",
});

async function readGithubFile({
  owner,
  repo,
  path,
  branch,
  githubToken,
}: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  githubToken: string;
}) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  if (!data.content) {
    return null;
  }

  const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    path,
    content: decodedContent.slice(0, 5000),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testCaseId, baseUrl, mode = "generate", customPrompt = "" } = body;

    if (!testCaseId || !baseUrl) {
      return NextResponse.json(
        { error: "testCaseId and baseUrl are required" },
        { status: 400 }
      );
    }

    // Resolve localhost to 127.0.0.1 to prevent IPv6 DNS loopback connection issues
    let resolvedBaseUrl = baseUrl;
    if (resolvedBaseUrl.includes("localhost")) {
      resolvedBaseUrl = resolvedBaseUrl.replace("localhost", "127.0.0.1");
    }

    // 1. Fetch test case from DB
    const [testCase] = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.id, testCaseId));

    if (!testCase) {
      return NextResponse.json({ error: "Test case not found" }, { status: 404 });
    }

    // Fetch repository settings for global instructions
    let repoRecord = null;
    if (testCase.repoId) {
      const [r] = await db
        .select()
        .from(repositories)
        .where(eq(repositories.repoId, parseInt(testCase.repoId)));
      repoRecord = r;
    }

    if (!repoRecord) {
      const [r] = await db
        .select()
        .from(repositories)
        .where(
          eq(
            repositories.fullName,
            `${testCase.repoOwner}/${testCase.repoName}`
          )
        );
      repoRecord = r;
    }

    let scriptText = testCase.browserbaseScript;
    const forceRegenerate = mode === "generate" || !scriptText;

    // 2. Generate script using Gemini if forced, or if no script is cached
    if (forceRegenerate) {
      const cookiesStore = await cookies();
      const githubToken = cookiesStore.get("github_token")?.value;

      if (!githubToken) {
        return NextResponse.json(
          { error: "GitHub authentication token is missing or expired" },
          { status: 401 }
        );
      }

      // Fetch target files context
      const targetFiles = testCase.targetFiles || [];
      let repoContext = "";

      if (targetFiles.length > 0) {
        const fileContents = await Promise.all(
          targetFiles.map((path) =>
            readGithubFile({
              owner: testCase.repoOwner,
              repo: testCase.repoName,
              branch: testCase.branch || "main",
              path,
              githubToken,
            })
          )
        );

        const validFiles = fileContents.filter(Boolean);
        repoContext = validFiles
          .map(
            (file: any) => `
File Path: ${file.path}
File Content:
${file.content}
`
          )
          .join("\n\n-------------------------------\n\n");
      }

      // Build global instructions and runtime prompts
      const globalIns = repoRecord?.globalInstruction
        ? `\n[GLOBAL PROJECT INSTRUCTIONS] (Follow strictly):\n${repoRecord.globalInstruction}\n`
        : "";

      const tempIns = customPrompt
        ? `\n[ADDITIONAL RUNTIME INSTRUCTIONS] (Follow strictly):\n${customPrompt}\n`
        : "";

      // Prompt Gemini for Playwright code string
      const prompt = `
You are an expert QA automation engineer.
Your task is to write a Playwright Node.js script body that executes a test case on an application running at URL: "${resolvedBaseUrl}".
Test Case Details:
Title: ${testCase.title}
Description: ${testCase.description}
Target Route: ${testCase.targetRoute || "/"}
Expected Result: ${testCase.expectedResult}
${globalIns}
${tempIns}
Source File Context for Reference (Read this to extract exact tags, component text, input fields, and class names):
${repoContext || "No source file context available for this test case."}
Write only the JavaScript code that executes within an async function context.
The following variables are pre-injected into your runtime environment:
'page': The Playwright Page object.
'console': The custom console object to output log messages.
IMPORTANT:
Do NOT assume Node.js 'assert' is available.
Do NOT import assert or any other module.
At the top of the generated script, always define this custom assert helper:
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
Rules for your code:
DO NOT import playwright, browserbase, assert, or any other modules.
Navigate to the target route using:
await page.goto(\`${resolvedBaseUrl}\${testCase.targetRoute || ""}\`, { waitUntil: 'load', timeout: 15000 })
followed by a short settle wait: \`await page.waitForTimeout(1000)\`
Carefully analyze the Source File Context provided to find the EXACT forms, inputs, placeholders, buttons, and elements. Look for:
Input names, placeholder texts, or labels (e.g. \`page.getByPlaceholder('Enter your name')\` or \`page.locator('input[name="email"]')\`).
Button texts (e.g. \`page.getByRole('button', { name: /submit/i })\` or \`page.locator('button:has-text("Submit")')\`).
Apply extreme selector resilience:
If a specific selector or locator might fail, use flexible text-matching locators or check multiple variations.
ALWAYS wait for an element to be visible before interacting with it: \`await page.waitForSelector('selector-or-text', { state: 'visible', timeout: 4000 }).catch(() => {})\`.
Scroll elements into view before interaction to prevent out-of-bounds clicks: \`await locator.scrollIntoViewIfNeeded().catch(() => {})\`.
If standard click fails or throws a timeout, try forcing it or using DOM-based dispatch click as a safe backup:
\`await locator.click({ force: true, timeout: 2000 }).catch(async () => { await locator.evaluate(node => node.click()).catch(() => {}) })\`.
Introduce generous settling times:
Add \`await page.waitForTimeout(1000)\` after major actions (clicks, inputs, typing, form submissions) to allow React, Next.js, or server state updates to propagate and elements to render.
Use lenient, substring-based assertions:
Do NOT use strict case-sensitive equality matches on text contents.
Instead, search for presence or substring content in a relaxed, case-insensitive way. E.g.:
\`const bodyText = await page.innerText('body');\`
\`assert(bodyText.toLowerCase().includes('\${testCase?.expectedResult?.toLowerCase().replace(/'/g, "\\\\'")}\'), 'Expected result state not matched');\`
Or assert visibility of key success elements instead of exact string matching.
Print descriptive logs at each step using \`console.log()\` to make debugging a breeze for the user.
Return ONLY the raw JavaScript executable code.
DO NOT wrap the code in markdown code blocks like \`\`\`javascript or \`\`\`.
DO NOT include any explanation.
Just return the executable code.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let generatedCode = response.text || "";
      // Clean up any stray markdown wrappers just in case
      generatedCode = generatedCode.replace(/^```javascript\s*/i, "");
      generatedCode = generatedCode.replace(/^```js\s*/i, "");
      generatedCode = generatedCode.replace(/```$/, "");
      generatedCode = generatedCode.trim();

      if (!generatedCode) {
        return NextResponse.json(
          { error: "Gemini failed to generate an automation script" },
          { status: 500 }
        );
      }

      scriptText = generatedCode;

      // Save the generated script immediately to database
      await db
        .update(TestCasesTable)
        .set({
          browserbaseScript: scriptText,
          status: "running",
        })
        .where(eq(TestCasesTable.id, testCase.id));
    } else {
      // 3. Mark database status as running
      await db
        .update(TestCasesTable)
        .set({ status: "running" })
        .where(eq(TestCasesTable.id, testCase.id));
    }

    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) =>
        logs.push(
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
            .join(" ")
        ),
      error: (...args: any[]) =>
        logs.push(
          "[ERROR] " +
            args
              .map((a) =>
                typeof a === "object" ? JSON.stringify(a) : String(a)
              )
              .join(" ")
        ),
      warn: (...args: any[]) =>
        logs.push(
          "[WARN] " +
            args
              .map((a) =>
                typeof a === "object" ? JSON.stringify(a) : String(a)
              )
              .join(" ")
        ),
    };

    let session: any = null;
    let browser: any = null;
    let isLocal = false;

    try {
      // Check if we are trying to access a localhost environment
      if (resolvedBaseUrl.includes("localhost") || resolvedBaseUrl.includes("127.0.0.1")) {
        try {
          logs.push(`[SYSTEM] Target URL is localhost. Attempting local Chromium execution to access it directly...`);
          browser = await chromium.launch({ headless: true });
          isLocal = true;
          logs.push(`[SYSTEM] Local Chromium launched successfully.`);
        } catch (localErr: any) {
          logs.push(`[SYSTEM WARNING] Local Chromium launch failed: ${localErr.message || String(localErr)}`);
          logs.push(`[SYSTEM WARNING] Troubleshooting Localhost Testing:`);
          logs.push(`[SYSTEM WARNING] 1. To run tests locally, install Chromium by executing "npx playwright install chromium" in your project folder.`);
          logs.push(`[SYSTEM WARNING] 2. Alternatively, to run tests in the Browserbase cloud, expose your local server using a tunnel tool like ngrok (e.g. "ngrok http 3000") and use the public tunnel URL as your Target Website URL.`);
        }
      }

      if (!browser) {
        logs.push(`[SYSTEM] Attempting Browserbase cloud execution...`);
        // 4. Create Browserbase Session
        session = await bb.sessions.create({
          projectId: process.env.BROWSERBASE_PROJECT_ID!,
        });

        logs.push(
          `[SYSTEM] Browserbase session created successfully with ID: ${session.id}`
        );

        // 5. Connect Playwright to Session (Using native context connectUrl property)
        browser = await chromium.connectOverCDP(session.connectUrl);
      }
      
      const context = isLocal ? await browser.newContext() : browser.contexts()[0];
      
      // Intercept network requests to inject the bypass header ONLY for same-origin requests
      // This completely avoids CORS preflight failures on third-party CDNs (Clerk, Google Fonts)
      const baseOrigin = new URL(resolvedBaseUrl).origin;
      await context.route("**/*", async (route: any, request: any) => {
        try {
          const url = new URL(request.url());
          if (
            url.origin === baseOrigin ||
            url.hostname.includes("127.0.0.1") ||
            url.hostname.includes("localhost") ||
            url.hostname.includes("vercel.app")
          ) {
            const headers = {
              ...request.headers(),
              "x-test-bypass": "true",
            };
            await route.continue({ headers });
          } else {
            await route.continue();
          }
        } catch (routeErr) {
          await route.continue().catch(() => {});
        }
      });

      // Fallback in case a page is not already initialized by Browserbase proxy
      const page = isLocal ? await context.newPage() : (context.pages()[0] || (await context.newPage()));

      // 6. Listen to Browser Console Events
      page.on("console", (msg: any) => {
        logs.push(`[BROWSER] [${msg.type().toUpperCase()}] ${msg.text()}`);
      });

      logs.push(`[SYSTEM] Connected to Browserbase cloud browser, executing script...`);

      // 7. Compile and run script
      // Resolve localhost to 127.0.0.1 and translate production Vercel URLs to the local execution domain
      let resolvedScriptText = scriptText;
      if (resolvedScriptText) {
        resolvedScriptText = resolvedScriptText.replace(/https:\/\/ai-testing-automation\.vercel\.app\/?/g, resolvedBaseUrl);
        if (resolvedBaseUrl.includes("127.0.0.1")) {
          resolvedScriptText = resolvedScriptText.replace(/localhost:3000/g, "127.0.0.1:3000");
          resolvedScriptText = resolvedScriptText.replace(/localhost/g, "127.0.0.1");
        }
      }

      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const runFn = new AsyncFunction("page", "assert", "console", "testCase", resolvedScriptText);

      // Mock assertion helper for runtime container if script assumes assert is global
      const assertHelper = (condition: boolean, message?: string) => {
        if (!condition) {
          throw new Error(message || "Assertion failed");
        }
      };

      await runFn(page, assertHelper, customConsole, testCase);

      logs.push(`[SYSTEM] Script execution completed successfully without errors.`);

      // 8. Clean up session and browser
      await page.close().catch(() => {});
      await browser.close().catch(() => {});

      // 9. Update DB Status to passed
      await db
        .update(TestCasesTable)
        .set({
          status: "passed",
          browserbaseScript: scriptText,
          logs: logs,
          sessionId: session.id,
          sessionUrl: `https://www.browserbase.com/sessions/${session.id}`,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      return NextResponse.json({
        success: true,
        status: "passed",
        sessionId: session.id,
        sessionUrl: `https://www.browserbase.com/sessions/${session.id}`,
        logs,
        browserbaseScript: scriptText,
      });
    } catch (execError: any) {
      console.error("Script execution error:", execError);
      logs.push(`[SYSTEM ERROR] Script execution failed: ${execError.message || String(execError)}`);

      // Clean up session and browser if still active
      if (browser) {
        await browser.close().catch(() => {});
      }

      // 10. Update DB Status to failed
      await db
        .update(TestCasesTable)
        .set({
          status: "failed",
          browserbaseScript: scriptText,
          logs: logs,
          sessionId: session?.id || null,
          sessionUrl: session ? `https://www.browserbase.com/sessions/${session.id}` : null,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      return NextResponse.json({
        success: false,
        status: "failed",
        error: execError.message || String(execError),
        sessionId: session?.id,
        sessionUrl: session ? `https://www.browserbase.com/sessions/${session.id}` : null,
        logs,
        browserbaseScript: scriptText,
      });
    }
  } catch (error: any) {
    console.error("API endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}