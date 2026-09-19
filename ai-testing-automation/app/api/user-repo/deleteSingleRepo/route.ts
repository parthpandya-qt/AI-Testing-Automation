import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { repositories, TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { invalidateTestCasesCache } from "@/lib/testCasesCache";

export async function DELETE(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const testCaseParam = searchParams.get("testCaseId") || searchParams.get("repoId");
        const testCaseId = Number(testCaseParam);

        if (!testCaseId || isNaN(testCaseId)) {
            return NextResponse.json(
                { error: "Valid test case ID is required" },
                { status: 400 }
            );
        }

        // Find test case
        const testCase = await db
            .select()
            .from(TestCasesTable)
            .where(eq(TestCasesTable.id, testCaseId))
            .limit(1);

        if (testCase.length === 0) {
            return NextResponse.json(
                { error: "Test case not found" },
                { status: 404 }
            );
        }

        // Verify repository ownership or user ownership
        if (testCase[0].userId === String(user.id)) {
            await db
                .delete(TestCasesTable)
                .where(eq(TestCasesTable.id, testCaseId));

            invalidateTestCasesCache(user.id, testCase[0].repoId);

            return NextResponse.json({
                success: true,
                message: "Test case deleted successfully",
            });
        }

        const repo = await db
            .select()
            .from(repositories)
            .where(
                eq(
                    repositories.repoId,
                    Number(testCase[0].repoId)
                )
            )
            .limit(1);

        if (repo.length === 0 || repo[0].userId !== user.id) {
            return NextResponse.json(
                { error: "Forbidden: You do not own this test case" },
                { status: 403 }
            );
        }

        // Delete only this test case
        await db
            .delete(TestCasesTable)
            .where(eq(TestCasesTable.id, testCaseId));

        invalidateTestCasesCache(user.id, testCase[0].repoId);

        return NextResponse.json({
            success: true,
            message: "Test case deleted successfully",
        });
    } catch (error: any) {
        console.error("Delete single test case error:", error);

        return NextResponse.json(
            { error: error?.message || "Failed to delete test case" },
            { status: 500 }
        );
    }
}