import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "@/db";
import { TestCasesTable, users, repositories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const DEFAULT_IGNORE_PATHS = [
  "node_modules",
  ".next",
  "build",
  "dist",
  ".git",
  "coverage",
  "public",
  "target",
  ".gradle",
  "gradle",
  ".idea",
  "bin",
  "out",
  "__pycache__",
  "venv",
  ".venv",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".mp4",
  ".mov",
  ".zip",
  ".tar",
];

function isUsefulFile(filePath: string, allowedExtensions: string[], ignorePaths: string[]) {
  const isIgnored = ignorePaths.some((item) => filePath.includes(item));
  const isAllowed = allowedExtensions.some((ext) => filePath.endsWith(ext));
  return !isIgnored && isAllowed;
}

async function getRepoTree({
  owner,
  repo,
  branch,
  githubToken,
  allowedExtensions,
  ignorePaths,
}: {
  owner: string;
  repo: string;
  branch: string;
  githubToken: string;
  allowedExtensions: string[];
  ignorePaths: string[];
}) {
  let targetBranch = branch || "main";
  let res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok && targetBranch === "main") {
    targetBranch = "master";
    res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub repo tree for ${owner}/${repo} (branch: ${branch})`);
  }

  const data = await res.json();
  if (!Array.isArray(data.tree)) return [];

  return data.tree
    .filter((item: any) => item.type === "blob")
    .filter((item: any) => isUsefulFile(item.path, allowedExtensions, ignorePaths))
    .slice(0, 20);
}

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;

    const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

    return {
      path,
      content: decodedContent.slice(0, 4000),
    };
  } catch {
    return null;
  }
}

export async function generateStackTestCases({
  req,
  techStack,
  allowedExtensions,
  customIgnorePaths = [],
  stackPrompt,
}: {
  req: NextRequest;
  techStack: string;
  allowedExtensions: string[];
  customIgnorePaths?: string[];
  stackPrompt?: string;
}) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.credits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits to generate test cases." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const githubToken =
      req.cookies.get(`github_token_${user.id}`)?.value || req.cookies.get("github_token")?.value;

    const { repoId, owner, repo, branch = "main" } = body;

    if (!repoId || !owner || !repo || !githubToken) {
      return NextResponse.json(
        { error: "repoId, owner, repo and githubToken are required" },
        { status: 400 }
      );
    }

    // Verify repository ownership
    const repoCheck = await db
      .select()
      .from(repositories)
      .where(and(eq(repositories.repoId, Number(repoId)), eq(repositories.userId, user.id)))
      .limit(1);

    if (repoCheck.length === 0) {
      return NextResponse.json({ error: "Forbidden: You do not own this repository" }, { status: 403 });
    }

    // Ensure repository techStack is updated
    await db.update(repositories).set({ techStack }).where(eq(repositories.repoId, Number(repoId)));

    const userIdStr = String(user.id);
    const combinedIgnorePaths = [...DEFAULT_IGNORE_PATHS, ...customIgnorePaths];

    const repoFiles = await getRepoTree({
      owner,
      repo,
      branch,
      githubToken,
      allowedExtensions,
      ignorePaths: combinedIgnorePaths,
    });

    const fileContents = await Promise.all(
      repoFiles.map((file: any) =>
        readGithubFile({
          owner,
          repo,
          branch,
          path: file.path,
          githubToken,
        })
      )
    );

    const validFiles = fileContents.filter(Boolean);

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: `No useful ${techStack.toUpperCase()} source files found in this repository.` },
        { status: 400 }
      );
    }

    const repoContext = validFiles
      .map((file: any) => `\nFile Path: ${file.path}\nFile Content:\n${file.content}\n`)
      .join("\n\n--------------------\n\n");

    const defaultPromptHeader = `
You are an expert QA automation engineer specializing in ${techStack.toUpperCase()} applications.
Analyze the GitHub repository source code and generate useful E2E Playwright browser and API test cases.

Tech Stack: ${techStack.toUpperCase()}
Repository: ${owner}/${repo} (branch: ${branch})

${stackPrompt || ""}

Repository File Context:
${repoContext}

Generate 5 to 10 test cases covering UI routes, form submissions, auth flows, and REST API endpoints.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: defaultPromptHeader,
      config: {
        temperature: 0.2,
        maxOutputTokens: 2500,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            testCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: ["ui", "auth", "api", "form", "integration", "edge-case"],
                  },
                  priority: {
                    type: Type.STRING,
                    enum: ["low", "medium", "high"],
                  },
                  targetRoute: { type: Type.STRING },
                  targetFiles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  expectedResult: { type: Type.STRING },
                },
                required: [
                  "title",
                  "description",
                  "type",
                  "priority",
                  "targetRoute",
                  "targetFiles",
                  "expectedResult",
                ],
              },
            },
          },
          required: ["testCases"],
        },
      },
    });

    let rawResponseText = response.text || "{}";
    rawResponseText = rawResponseText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
    const aiResult = JSON.parse(rawResponseText || "{}");
    const testCases = aiResult.testCases || [];

    if (!testCases.length) {
      return NextResponse.json({ error: "Gemini did not generate any test cases" }, { status: 400 });
    }

    const insertedTestCases = await db
      .insert(TestCasesTable)
      .values(
        testCases.map((testCase: any) => ({
          userId: userIdStr,
          repoId: String(repoId),
          repoName: repo,
          repoOwner: owner,
          branch,
          techStack,
          title: testCase.title,
          description: testCase.description,
          type: testCase.type,
          priority: testCase.priority,
          targetRoute: testCase.targetRoute,
          targetFiles: testCase.targetFiles || [],
          expectedResult: testCase.expectedResult,
          status: "generated",
        }))
      )
      .returning();

    const generatedCount = insertedTestCases.length;
    const creditCost = generatedCount * 10;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    let newCredits = 0;
    if (existingUser) {
      newCredits = Math.max(0, existingUser.credits - creditCost);
      await db.update(users).set({ credits: newCredits }).where(eq(users.id, user.id));
    }

    return NextResponse.json({
      success: true,
      message: `Test cases generated successfully for ${techStack.toUpperCase()}`,
      count: insertedTestCases.length,
      testCases: insertedTestCases,
      credits: newCredits,
    });
  } catch (error: any) {
    console.error(`Generate ${techStack} test cases error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate test cases" },
      { status: 500 }
    );
  }
}
