import { NextRequest } from "next/server";
import { generateStackTestCases } from "@/lib/generateStackTestCases";

export async function POST(req: NextRequest) {
  return generateStackTestCases({
    req,
    techStack: "java",
    allowedExtensions: [
      ".java",
      ".jsp",
      ".kt",
      ".xml",
      ".gradle",
      ".properties",
      ".yaml",
      ".yml",
      ".html",
    ],
    customIgnorePaths: ["target", ".gradle", "gradle", ".idea", "bin", "out"],
    stackPrompt: `
JAVA & SPRING BOOT SPECIALIZED INSTRUCTIONS:
- Analyze Java Spring Boot Controllers (@RestController, @Controller, @RequestMapping, @GetMapping, @PostMapping, @PutMapping, @DeleteMapping).
- Identify request paths, query parameters (@RequestParam), path variables (@PathVariable), and request body DTOs (@RequestBody).
- Analyze JSP, Thymeleaf, and HTML templates for UI form inputs and buttons.
- Target routes should reflect Spring Boot web paths (e.g. /api/users, /login, /dashboard, /products).
- Target files should focus on Controller classes, DTOs, and view templates.
`,
  });
}
