import { db, TestCasesTable, repositories } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");
    if (!repoId) {
        return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
    }

    try {
        // Verify that the repository exists and belongs to the authenticated user
        const repo = await db.select().from(repositories).where(eq(repositories.repoId, Number(repoId))).limit(1);
        if (repo.length === 0) {
            return NextResponse.json({ error: "Repository not found" }, { status: 404 });
        }
        if (repo[0].userId !== user.id) {
            return NextResponse.json({ error: "Forbidden: You do not own this repository" }, { status: 403 });
        }

        const result = await db.select().from(TestCasesTable).where(eq(TestCasesTable.repoId, repoId));
        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Test cases API error:", err);
        return NextResponse.json({ error: "Failed to retrieve test cases" }, { status: 500 });
    }
}