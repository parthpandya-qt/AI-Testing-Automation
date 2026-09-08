import { NextRequest } from "next/server";
import { generateStackTestCases } from "@/lib/generateStackTestCases";

export async function POST(req: NextRequest) {
  return generateStackTestCases({
    req,
    techStack: "mern",
    allowedExtensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".html", ".css"],
    customIgnorePaths: ["node_modules", "build", "dist", ".next", "coverage"],
    stackPrompt: `
MERN STACK (MONGODB, EXPRESS, REACT, NODE.JS) SPECIALIZED INSTRUCTIONS:
- Analyze Express.js backend routes (app.get, app.post, app.put, app.delete, router.get, router.post).
- Analyze Mongoose schemas/models, JWT auth middleware (req.user, authHeader), and REST API controllers.
- Analyze React frontend components (Vite / CRA / Next.js JSX/TSX views, forms, inputs, buttons, fetch/axios calls).
- Target routes should cover both React UI pages (e.g. /, /login, /register, /dashboard) and Express REST API endpoints (e.g. /api/auth/login, /api/products, /api/users).
- Target files should highlight Express routes, controllers, and React UI page components.
`,
  });
}
