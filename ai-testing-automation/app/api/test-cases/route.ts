import { db, TestCasesTable, repositories } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");

    try {
        // Fast path: if repoId is "all" or omitted, return all test cases across user's repos in 1 fast query
        if (!repoId || repoId === "all") {
            const userRepos = await db.select({ repoId: repositories.repoId })
                .from(repositories)
                .where(eq(repositories.userId, user.id));

            if (userRepos.length === 0) {
                return NextResponse.json([]);
            }

            const repoIds = userRepos.map(r => String(r.repoId));
            const allTestCases = await db.select()
                .from(TestCasesTable)
                .where(inArray(TestCasesTable.repoId, repoIds));

            return NextResponse.json(allTestCases);
        }

        // Single repo: run ownership check and test cases query in parallel
        const [repoOwnerCheck, testCases] = await Promise.all([
            db.select({ id: repositories.id })
                .from(repositories)
                .where(and(eq(repositories.repoId, Number(repoId)), eq(repositories.userId, user.id)))
                .limit(1),
            db.select()
                .from(TestCasesTable)
                .where(eq(TestCasesTable.repoId, repoId))
        ]);

        if (repoOwnerCheck.length === 0) {
            return NextResponse.json({ error: "Repository not found or forbidden" }, { status: 404 });
        }

        return NextResponse.json(testCases);
    } catch (err: any) {
        console.error("Test cases API error:", err);
        return NextResponse.json({ error: "Failed to retrieve test cases" }, { status: 500 });
    }
}