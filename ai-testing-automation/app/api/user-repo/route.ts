import { NextRequest, NextResponse } from "next/server";
import { db, repositories, TestCasesTable } from "@/db";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId, name, full_name, description, html_url, updated_at, language, default_branch, owner, private_ } = await req.json();

    try {
        const result = await db.insert(repositories).values({
            repoId,
            userId: user.id, // Enforce authenticated user's ID
            name,
            fullName: full_name,
            description,
            htmlUrl: html_url,
            updatedAt: new Date(updated_at),
            language,
            owner,
            private: private_ ? 1 : 0,
            defaultBranch: default_branch
        }).returning();
        return NextResponse.json(result[0]);

    } catch (err: any) {
        console.log(err);
        return NextResponse.json({ error: "Failed to save repository" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Retrieve repositories belonging only to the authenticated user
        const result = await db.select().from(repositories).where(eq(repositories.userId, user.id));
        return NextResponse.json(result);
    } catch (err: any) {
        console.log(err);
        return NextResponse.json({ error: "Failed to retrieve repositories" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoId = Number(searchParams.get("repoId"));
    if (!repoId) {
        return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
    }

    try {
        // Verify that the repository belongs to the authenticated user before deleting
        const repo = await db.select().from(repositories).where(eq(repositories.repoId, repoId)).limit(1);
        if (repo.length === 0) {
            return NextResponse.json({ error: "Repository not found" }, { status: 404 });
        }
        if (repo[0].userId !== user.id) {
            return NextResponse.json({ error: "Forbidden: You do not own this repository" }, { status: 403 });
        }

        await db.delete(repositories).where(eq(repositories.repoId, repoId));
        await db.delete(TestCasesTable).where(eq(TestCasesTable.repoId, String(repoId)));
        
        return NextResponse.json({ message: "Repository deleted successfully" });
    } catch (err: any) {
        console.log(err);
        return NextResponse.json({ error: "Failed to delete repository" }, { status: 500 });
    }
}
