import { NextRequest } from "next/server";
import { generateStackTestCases } from "@/lib/generateStackTestCases";

export async function POST(req: NextRequest) {
  return generateStackTestCases({
    req,
    techStack: "go",
    allowedExtensions: [".go", ".html", ".json"],
    customIgnorePaths: ["vendor", "bin"],
    stackPrompt: `
GO (GOLANG) SPECIALIZED INSTRUCTIONS:
- Analyze Go HTTP servers using Standard net/http, Gin (r.GET, r.POST), Fiber (app.Get, app.Post), Chi, or Gorilla Mux.
- Identify HTML templates (html/template), JSON response structs, form handlers, and REST API routes.
`,
  });
}
