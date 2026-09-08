import { NextRequest } from "next/server";
import { generateStackTestCases } from "@/lib/generateStackTestCases";

export async function POST(req: NextRequest) {
  return generateStackTestCases({
    req,
    techStack: "python",
    allowedExtensions: [".py", ".html", ".json", ".yaml", ".yml"],
    customIgnorePaths: ["__pycache__", "venv", ".venv", ".pytest_cache"],
    stackPrompt: `
PYTHON WEB FRAMEWORK SPECIALIZED INSTRUCTIONS:
- Analyze Django (urls.py, views.py, serializers.py), Flask (@app.route), or FastAPI (@app.get, @app.post, Pydantic models).
- Identify HTML Jinja2 templates, form inputs, CSRF tokens, and REST API endpoints.
- Target routes should reflect Python app URLs (e.g. /login, /api/v1/items, /dashboard).
`,
  });
}
