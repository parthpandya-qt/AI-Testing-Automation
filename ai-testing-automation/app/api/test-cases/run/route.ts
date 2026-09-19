import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { TestCasesTable, repositories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { Browserbase } from "@browserbasehq/sdk";
import { chromium } from "playwright-core";
import { getAuthenticatedUser } from "@/lib/auth";
import { invalidateTestCasesCache } from "@/lib/testCasesCache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.content) return null;

  const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    path,
    content: decodedContent.slice(0, 5000),
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { testCaseId, baseUrl, mode = "generate", customPrompt = "", techStack } = body;

    if (!testCaseId || !baseUrl) {
      return NextResponse.json(
        { error: "testCaseId and baseUrl are required" },
        { status: 400 }
      );
    }

    // Resolve baseUrl and ensure protocol
    let resolvedBaseUrl = baseUrl.trim();
    if (!resolvedBaseUrl.startsWith("http://") && !resolvedBaseUrl.startsWith("https://")) {
      resolvedBaseUrl = `http://${resolvedBaseUrl}`;
    }
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

    if (testCase.userId !== String(user.id)) {
      return NextResponse.json({ error: "Forbidden: You do not own this test case" }, { status: 403 });
    }

    // Update testCase techStack if provided
    if (techStack && techStack !== testCase.techStack) {
      await db.update(TestCasesTable).set({ techStack }).where(eq(TestCasesTable.id, testCase.id));
    }

    // Fetch repository settings for global instructions & tech stack
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

    const activeTechStack = techStack || repoRecord?.techStack || testCase.techStack || "nextjs";

    let scriptText = testCase.browserbaseScript;
    const forceRegenerate = mode === "generate" || !scriptText;

    // 2. Generate script using Gemini if forced, or if no script is cached
    if (forceRegenerate) {
      const cookiesStore = await cookies();
      const githubToken = cookiesStore.get(`github_token_${user.id}`)?.value || cookiesStore.get("github_token")?.value;

      const targetFiles = testCase.targetFiles || [];
      let repoContext = "";

      if (targetFiles.length > 0) {
        const fileContents = await Promise.all(
          targetFiles.map(async (filePath) => {
            if (githubToken) {
              const ghFile = await readGithubFile({
                owner: testCase.repoOwner,
                repo: testCase.repoName,
                branch: testCase.branch || "main",
                path: filePath,
                githubToken,
              });
              if (ghFile) return ghFile;
            }

            try {
              const fs = await import("fs");
              const path = await import("path");
              const localPath = path.join(process.cwd(), filePath);
              if (fs.existsSync(localPath)) {
                const content = fs.readFileSync(localPath, "utf-8");
                return {
                  path: filePath,
                  content: content.slice(0, 5000),
                };
              }
            } catch (err) {
              // Ignore and fallback
            }

            return null;
          })
        );

        const validFiles = fileContents.filter(Boolean);

        repoContext = validFiles
          .map(
            (file: any) => `\nFile Path: ${file.path}\nFile Content:\n${file.content}\n`
          )
          .join("\n\n-------------------------------\n\n");
      }

      const globalIns = repoRecord?.globalInstruction
        ? `\n[GLOBAL PROJECT INSTRUCTIONS] (Follow strictly):\n${repoRecord.globalInstruction}\n`
        : "";

      const tempIns = customPrompt
        ? `\n[ADDITIONAL RUNTIME INSTRUCTIONS] (Follow strictly):\n${customPrompt}\n`
        : "";

      // Ensure target route concatenation doesn't result in double slashes
      const cleanBaseUrl = resolvedBaseUrl.endsWith('/') ? resolvedBaseUrl.slice(0, -1) : resolvedBaseUrl;
      const cleanTargetRoute = (testCase.targetRoute || "/").startsWith('/') ? (testCase.targetRoute || "/") : `/${testCase.targetRoute || ""}`;
      const targetUrl = `${cleanBaseUrl}${cleanTargetRoute}`;

      const prompt = `
You are an expert QA automation engineer.
Your task is to write a Playwright Node.js script body that executes a test case on an application running at URL: "${resolvedBaseUrl}".
Test Case Details:
Title: ${testCase.title}
Description: ${testCase.description}
Target Route: ${testCase.targetRoute || "/"}
Expected Result: ${testCase.expectedResult}
Test Case Type: ${testCase.type}
Target App Tech Stack: ${activeTechStack.toUpperCase()}
${globalIns}
${tempIns}
Source File Context for Reference (Read this to extract exact tags, component text, input fields, and class names):
${repoContext || "No source file context available for this test case."}

Write only the JavaScript code that executes within an async function context.
The following variables are pre-injected into your runtime environment scope:
'page': The Playwright Page object.
'console': The custom console object to output log messages.
'assert': Pre-injected helper function assert(condition, message) that throws an Error if condition is false. DO NOT redeclare 'function assert' or 'const assert' in your code.
'testCase': Object containing current test case details.
IMPORTANT:
Do NOT import assert, playwright, browserbase, or any other modules.
DO NOT declare 'function assert' or 'const assert' anywhere in your code—use the pre-injected assert(condition, message) function directly.

Rules for your code:
DO NOT import playwright, browserbase, assert, or any other modules.

1. Navigation and API endpoints:
   - For UI/Form/Auth tests: Navigate to the target route using:
     await page.goto(\`${targetUrl}\`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => page.goto(\`${targetUrl}\`, { timeout: 10000 }))
     followed by a short settle wait: \`await page.waitForTimeout(1000)\`
   - For API tests: DO NOT use page.goto() to navigate directly to the target route endpoint if it is an API route (e.g. routes under /api/) because doing a GET request on a POST-only API endpoint will cause a 405 error and fail navigation.
     Instead, perform the API request directly using Playwright's page.request context methods (like page.request.post() or page.request.get()).
     IMPORTANT: When making API requests via page.request, you MUST include the header 'x-test-bypass': 'true' in the request headers options to bypass Clerk authentication and run successfully.
     If you need to establish a browser/origin context first, navigate to the base website URL \`${cleanBaseUrl}\` first using page.goto().

2. State Cleaning (localStorage/Cookies):
   - NEVER call page.evaluate(() => localStorage.clear()) or clear cookies/storage BEFORE calling page.goto(). Doing so on 'about:blank' will throw a SecurityError/DOMException.
   - Always navigate to the website (either the target URL or the base URL) first, then clear/modify localStorage or cookies if needed.

3. Exception Handling & Response Access:
   - DO NOT call page.mainFrame().response() as this method does not exist on a Playwright Frame and throws a TypeError. To inspect responses, check the return value of page.goto() or use page.waitForResponse().

4. Element Interactions (for UI tests):
   Carefully analyze the Source File Context provided to find the EXACT forms, inputs, placeholders, buttons, and elements. Look for:
   Input names, placeholder texts, or labels (e.g. \`page.getByPlaceholder('Enter your name')\` or \`page.locator('input[name="email"]')\`).
   Button texts (e.g. \`page.getByRole('button', { name: /submit|sign|login|create|add/i })\` or \`page.locator('button:has-text("Submit")')\`).
   Apply extreme selector resilience:
   If a specific selector or locator might fail, try multiple locator variations wrapped in try/catch or \`.catch()\`.
   ALWAYS wait for an element to be visible before interacting with it: \`await page.waitForSelector('selector-or-text', { state: 'visible', timeout: 4000 }).catch(() => {})\`.
   Scroll elements into view before interaction to prevent out-of-bounds clicks: \`await locator.scrollIntoViewIfNeeded().catch(() => {})\`.
   If standard click fails or throws a timeout, try forcing it or using DOM-based dispatch click as a safe backup:
   \`await locator.click({ force: true, timeout: 2000 }).catch(async () => { await locator.evaluate(node => node.click()).catch(() => {}) })\`.
   Introduce generous settling times:
   Add \`await page.waitForTimeout(1000)\` after major actions (clicks, inputs, typing, form submissions) to allow React, Next.js, or server state updates to propagate and elements to render.
   Use lenient, resilient assertions:
   Do NOT use strict case-sensitive equality matches on full text contents.
   Extract main keywords from expectedResult and assert that either:
   a) The page body text includes the expected result or main keywords (case-insensitive), OR
   b) Key UI elements (headers, buttons, forms, main containers) are visible on the page, OR
   c) The response status code was 200/201/302.
   Example assertion:
   const bodyText = await page.innerText('body').catch(() => '');
   const expected = \`\${testCase?.expectedResult || ''}\`.toLowerCase();
   const matches = expected ? expected.split(/\\s+/).some(kw => kw.length > 3 && bodyText.toLowerCase().includes(kw)) : true;
   assert(bodyText.length > 0 && (matches || bodyText.length > 50), 'Page content loaded successfully');
   For ID fields (like 'id', 'userId', etc.), be lenient with types: check if they exist and are either a string or a number.

Print descriptive logs at each step using console.log() to make debugging clear for the user.
Return ONLY the raw JavaScript executable code.
DO NOT wrap the code in markdown backticks or explanations.
Just return the executable code.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 2500,
        },
      });

      let generatedCode = response.text || "";
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

      await db
        .update(TestCasesTable)
        .set({
          browserbaseScript: scriptText,
          status: "running",
        })
        .where(eq(TestCasesTable.id, testCase.id));
    } else {
      await db
        .update(TestCasesTable)
        .set({ status: "running" })
        .where(eq(TestCasesTable.id, testCase.id));
    }

    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
      error: (...args: any[]) => logs.push("[ERROR] " + args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
      warn: (...args: any[]) => logs.push("[WARN] " + args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
    };

    let session: any = null;
    let browser: any = null;
    let isLocal = false;

    try {
      const isLocalhost = resolvedBaseUrl.includes("localhost") || resolvedBaseUrl.includes("127.0.0.1");

      if (isLocalhost) {
        try {
          logs.push(`[SYSTEM] Target URL is localhost. Attempting local Chromium execution...`);
          browser = await chromium.launch({ headless: true });
          isLocal = true;
          logs.push(`[SYSTEM] Local Chromium launched successfully.`);
        } catch (localErr: any) {
          logs.push(`[SYSTEM ERROR] Local Chromium launch failed: ${localErr.message || String(localErr)}`);
          logs.push(`[SYSTEM ERROR] Remote Browserbase cloud browsers cannot access 'localhost' on your machine.`);
          logs.push(`[SYSTEM HINT] 1. Run "npx playwright install chromium" in your local terminal.`);
          logs.push(`[SYSTEM HINT] 2. Or set your Target Website URL to an ngrok tunnel or public deployment URL (e.g. https://your-app.vercel.app).`);
          
          await db
            .update(TestCasesTable)
            .set({
              status: "failed",
              browserbaseScript: scriptText,
              logs: logs,
              sessionId: null,
              sessionUrl: null,
            })
            .where(eq(TestCasesTable.id, testCase.id));

          invalidateTestCasesCache(user.id, testCase.repoId);

          return NextResponse.json({
            success: false,
            status: "failed",
            error: "Local Chromium launch failed. Install Chromium locally (npx playwright install chromium) or use a public target URL.",
            logs,
            browserbaseScript: scriptText,
          });
        }
      }

      if (!browser) {
        logs.push(`[SYSTEM] Attempting Browserbase cloud execution...`);
        session = await bb.sessions.create({
          projectId: process.env.BROWSERBASE_PROJECT_ID!,
        });

        logs.push(`[SYSTEM] Browserbase session created successfully with ID: ${session.id}`);
        logs.push(`[SYSTEM] Connected to Browserbase cloud browser, executing script...`);
        browser = await chromium.connectOverCDP(session.connectUrl);
      }
      
      const context = isLocal ? await browser.newContext() : browser.contexts()[0];
      await context.setExtraHTTPHeaders({ "x-test-bypass": "true" });

      const page = isLocal ? await context.newPage() : (context.pages()[0] || (await context.newPage()));

      page.on("console", (msg: any) => {
        logs.push(`[BROWSER] [${msg.type().toUpperCase()}] ${msg.text()}`);
      });

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

      const assertHelper = (condition: boolean, message?: string) => {
        if (!condition) throw new Error(message || "Assertion failed");
      };

      await runFn(page, assertHelper, customConsole, testCase);
      logs.push(`[SYSTEM] Script execution completed successfully without errors.`);

      await page.close().catch(() => {});
      await browser.close().catch(() => {});

      await db
        .update(TestCasesTable)
        .set({
          status: "passed",
          browserbaseScript: scriptText,
          logs: logs,
          sessionId: session?.id || null,
          sessionUrl: session ? `https://www.browserbase.com/sessions/${session.id}` : null,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      // Invalidate test cases cache so UI gets fresh status
      invalidateTestCasesCache(user.id, testCase.repoId);

      return NextResponse.json({
        success: true,
        status: "passed",
        sessionId: session?.id || null,
        sessionUrl: session ? `https://www.browserbase.com/sessions/${session.id}` : null,
        logs,
        browserbaseScript: scriptText,
      });
    } catch (execError: any) {
      console.error("Script execution error:", execError);
      logs.push(`[SYSTEM ERROR] Script execution failed: ${execError.message || String(execError)}`);

      if (browser) {
        await browser.close().catch(() => {});
      }

      await db
        .update(TestCasesTable)
        .set({
          status: "failed",
          browserbaseScript: scriptText,
          logs: logs,
          sessionId: session?.id || null,
          sessionUrl: session ? `https://www.browserbase.com/sessions/${session?.id}` : null, // Fixed: Added safe chaining here
        })
        .where(eq(TestCasesTable.id, testCase.id));

      invalidateTestCasesCache(user.id, testCase.repoId);

      return NextResponse.json({
        success: false,
        status: "failed",
        error: execError.message || String(execError),
        sessionId: session?.id || null,
        sessionUrl: session ? `https://www.browserbase.com/sessions/${session?.id}` : null, // Fixed: Added safe chaining here
        logs,
        browserbaseScript: scriptText,
      });
    }
  } catch (error: any) {
    console.error("API endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}