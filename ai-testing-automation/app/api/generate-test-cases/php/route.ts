import { NextRequest } from "next/server";
import { generateStackTestCases } from "@/lib/generateStackTestCases";

export async function POST(req: NextRequest) {
  return generateStackTestCases({
    req,
    techStack: "php",
    allowedExtensions: [".php", ".html", ".css", ".json"],
    customIgnorePaths: ["vendor", "storage", "bootstrap/cache"],
    stackPrompt: `
PHP SPECIALIZED INSTRUCTIONS:
- Analyze Laravel routes (routes/web.php, routes/api.php), Controllers, Blade views (.blade.php), or Symfony routes.
- Identify HTML form fields, CSRF inputs (@csrf), button labels, and API responses.
`,
  });
}
