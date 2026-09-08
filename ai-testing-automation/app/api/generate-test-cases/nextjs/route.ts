import { NextRequest } from "next/server";
import { generateStackTestCases } from "@/lib/generateStackTestCases";

export async function POST(req: NextRequest) {
  return generateStackTestCases({
    req,
    techStack: "nextjs",
    allowedExtensions: [".tsx", ".ts", ".jsx", ".js", ".json", ".css", ".html"],
    customIgnorePaths: [".next", "build", "dist", "out"],
    stackPrompt: `
NEXT.JS & REACT SPECIALIZED INSTRUCTIONS:
- Analyze Next.js App Router (app/ directory routes) and Pages Router (pages/ directory routes).
- Identify React components, form elements, buttons, input placeholders, Tailwind class names, and Next.js API routes (route.ts / route.tsx / api/).
- Target routes should reflect Next.js page paths (e.g. /, /dashboard, /pricing, /sign-in, /api/user).
`,
  });
}
