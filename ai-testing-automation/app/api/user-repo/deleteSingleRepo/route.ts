import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { repositories, TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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
        const testCaseId = Number(searchParams.get("repoId"));

        console.log("Deleting test case:", testCaseId);

        if (!testCaseId) {
            return NextResponse.json(
                { error: "Test case ID is required" },
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

        // Verify repository ownership
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

        if (repo.length === 0) {
            return NextResponse.json(
                { error: "Repository not found" },
                { status: 404 }
            );
        }

        if (repo[0].userId !== user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // Delete only this test case
        await db
            .delete(TestCasesTable)
            .where(eq(TestCasesTable.id, testCaseId));

        return NextResponse.json({
            success: true,
            message: "Test case deleted successfully",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to delete test case" },
            { status: 500 }
        );
    }
}