import { NextRequest } from "next/server";
import { generateStackTestCases } from "@/lib/generateStackTestCases";

export async function POST(req: NextRequest) {
  return generateStackTestCases({
    req,
    techStack: "csharp",
    allowedExtensions: [".cs", ".cshtml", ".json", ".csproj"],
    customIgnorePaths: ["bin", "obj", ".vs"],
    stackPrompt: `
C# & ASP.NET CORE SPECIALIZED INSTRUCTIONS:
- Analyze C# ASP.NET Core Controllers ([ApiController], [Route], [HttpGet], [HttpPost], [FromBody]), and Razor Pages (.cshtml).
- Identify view models, form elements, validation attributes, and REST endpoints.
`,
  });
}
