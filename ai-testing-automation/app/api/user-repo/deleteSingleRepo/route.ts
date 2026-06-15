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

        const testCaseIdParam = searchParams.get("testCaseId");

        if (!testCaseIdParam) {
            return NextResponse.json(
                { error: "Test case ID is required" },
                { status: 400 }
            );
        }

        const testCaseId = Number(testCaseIdParam);

        if (isNaN(testCaseId)) {
            return NextResponse.json(
                { error: "Invalid test case ID" },
                { status: 400 }
            );
        }

        // Fetch test case and repository owner in a single query
        const result = await db
            .select({
                testCaseId: TestCasesTable.id,
                ownerId: repositories.userId,
            })
            .from(TestCasesTable)
            .innerJoin(
                repositories,
                eq(TestCasesTable.repoId, repositories.repoId)
            )
            .where(eq(TestCasesTable.id, testCaseId))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json(
                { error: "Test case not found" },
                { status: 404 }
            );
        }

        if (result[0].ownerId !== user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        await db
            .delete(TestCasesTable)
            .where(eq(TestCasesTable.id, testCaseId));

        return NextResponse.json({
            success: true,
            message: "Test case deleted successfully",
        });
    } catch (error) {
        console.error("DELETE ERROR:", error);

        return NextResponse.json(
            { error: "Failed to delete test case" },
            { status: 500 }
        );
    }
}