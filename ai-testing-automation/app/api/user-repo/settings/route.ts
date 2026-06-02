import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { repositories } from "@/db/schema";
export async function POST(req:NextRequest) {
    const body = await req.json();
    const { repoId, targetDomain, globalInstruction } = body;

    const result = await db?.update(repositories).set({
        targetDomain,
        globalInstruction
    }).where(eq(repositories.repoId, repoId)).returning();
    return NextResponse.json(result[0]);
    }