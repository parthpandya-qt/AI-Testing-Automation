import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { repositories } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { repoId, targetDomain, globalInstruction, techStack } = body;

    if (!repoId) {
      return NextResponse.json({ error: "repoId is required" }, { status: 400 });
    }

    // Check ownership
    const repoCheck = await db
      .select()
      .from(repositories)
      .where(and(eq(repositories.repoId, Number(repoId)), eq(repositories.userId, user.id)))
      .limit(1);

    if (repoCheck.length === 0) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this repository" },
        { status: 403 }
      );
    }

    const updatePayload: any = {};
    if (targetDomain !== undefined) updatePayload.targetDomain = targetDomain;
    if (globalInstruction !== undefined) updatePayload.globalInstruction = globalInstruction;
    if (techStack !== undefined) updatePayload.techStack = techStack;

    const result = await db
      .update(repositories)
      .set(updatePayload)
      .where(eq(repositories.repoId, Number(repoId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Repository settings update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update repository settings" },
      { status: 500 }
    );
  }
}