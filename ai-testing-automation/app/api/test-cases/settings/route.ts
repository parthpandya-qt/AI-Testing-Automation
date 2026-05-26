import { NextRequest } from "next/server";
import { TestCasesTable, db } from "@/db";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const body = await req.json();
    const { title, description, targetRoute, expectedResult, repoId, testCaseId } = body;
    if (!title || !description || !targetRoute || !expectedResult || !repoId || !testCaseId) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const result = await db.update(TestCasesTable).set({
        title,
        description,
        targetRoute,
        expectedResult
    }).where(eq(TestCasesTable.id, testCaseId)).returning();
    return NextResponse.json(result[0]);
}