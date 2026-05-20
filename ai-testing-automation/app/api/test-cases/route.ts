import { db, TestCasesTable } from "@/db";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const repoId:any = searchParams.get("repoId");
    if(!repoId){
        return NextResponse.json({error: "Repository ID is required"}, {status: 400});
    }
    const result  = await db.select().from(TestCasesTable).where(eq(TestCasesTable.repoId, repoId));
    return NextResponse.json(result);
}