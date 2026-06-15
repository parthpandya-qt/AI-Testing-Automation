import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { repositories, TestCasesTable } from "@/db/schema";
import { sql } from "drizzle-orm";

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

        if (!testCaseId) {
            return NextResponse.json(
                { error: "Test case ID is required" },
                { status: 400 }
            );
        }

        await db.execute(sql`
            DELETE FROM ${TestCasesTable}
            USING ${repositories}
            WHERE ${TestCasesTable.id} = ${testCaseId}
              AND ${TestCasesTable.repoId} = ${repositories.repoId}
              AND ${repositories.userId} = ${user.id}
        `);

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