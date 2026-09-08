import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { repositories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";
import { generateStackTestCases } from "@/lib/generateStackTestCases";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyText = await req.text();
    const body = JSON.parse(bodyText || "{}");
    const { repoId, techStack: bodyStack } = body;

    let activeTechStack = bodyStack || "nextjs";

    if (repoId) {
      const [repo] = await db
        .select()
        .from(repositories)
        .where(and(eq(repositories.repoId, Number(repoId)), eq(repositories.userId, user.id)))
        .limit(1);

      if (repo && repo.techStack) {
        activeTechStack = repo.techStack;
      }
    }

    // Forward request to tech stack specific runner
    const clonedReq = new NextRequest(req.url, {
      method: "POST",
      headers: req.headers,
      body: bodyText,
    });

    switch (activeTechStack.toLowerCase()) {
      case "java":
        return generateStackTestCases({
          req: clonedReq,
          techStack: "java",
          allowedExtensions: [".java", ".jsp", ".kt", ".xml", ".gradle", ".properties", ".yaml", ".yml", ".html"],
          customIgnorePaths: ["target", ".gradle", "gradle", ".idea", "bin", "out"],
          stackPrompt: "JAVA & SPRING BOOT: Analyze Controllers (@RestController, @GetMapping, @PostMapping), DTOs, and JSP/Thymeleaf views.",
        });

      case "python":
        return generateStackTestCases({
          req: clonedReq,
          techStack: "python",
          allowedExtensions: [".py", ".html", ".json", ".yaml", ".yml"],
          customIgnorePaths: ["__pycache__", "venv", ".venv", ".pytest_cache"],
          stackPrompt: "PYTHON: Analyze Django urls.py/views.py, Flask @app.route, or FastAPI routes.",
        });

      case "go":
        return generateStackTestCases({
          req: clonedReq,
          techStack: "go",
          allowedExtensions: [".go", ".html", ".json"],
          customIgnorePaths: ["vendor", "bin"],
          stackPrompt: "GO (GOLANG): Analyze Gin/Fiber/Chi handlers and Go html/template structures.",
        });

      case "csharp":
        return generateStackTestCases({
          req: clonedReq,
          techStack: "csharp",
          allowedExtensions: [".cs", ".cshtml", ".json", ".csproj"],
          customIgnorePaths: ["bin", "obj", ".vs"],
          stackPrompt: "C# & ASP.NET CORE: Analyze Controllers ([ApiController], [HttpGet], [HttpPost]) and Razor Pages.",
        });

      case "php":
        return generateStackTestCases({
          req: clonedReq,
          techStack: "php",
          allowedExtensions: [".php", ".html", ".css", ".json"],
          customIgnorePaths: ["vendor", "storage", "bootstrap/cache"],
          stackPrompt: "PHP: Analyze Laravel routes (routes/web.php, routes/api.php), Controllers, and Blade views.",
        });

      case "mern":
        return generateStackTestCases({
          req: clonedReq,
          techStack: "mern",
          allowedExtensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".html", ".css"],
          customIgnorePaths: ["node_modules", "build", "dist", ".next", "coverage"],
          stackPrompt: "MERN STACK: Analyze Express backend routes, Mongoose models, and React frontend components.",
        });

      case "nextjs":
      default:
        return generateStackTestCases({
          req: clonedReq,
          techStack: "nextjs",
          allowedExtensions: [".tsx", ".ts", ".jsx", ".js", ".json", ".css", ".html"],
          customIgnorePaths: [".next", "build", "dist", "out"],
          stackPrompt: "NEXT.JS & REACT: Analyze App Router (app/), Pages Router (pages/), and Next API routes.",
        });
    }
  } catch (error: any) {
    console.error("Generate test cases dispatcher error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch test case generation" },
      { status: 500 }
    );
  }
}