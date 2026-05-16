import { NextRequest, NextResponse } from "next/server";
import {db, repositories} from "@/db";
import {eq} from "drizzle-orm";



export async function POST(req: NextRequest) {
    const { repoId, userId, name, full_name, description, html_url, updated_at, language, default_branch, owner, private_ } = await req.json();

    try{
        const result = await db.insert(repositories).values({
            repoId,
            userId,
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

    }catch(err:any){
        console.log(err);
        return NextResponse.json({error: "Failed to save repository"}, {status: 500});
    }
}
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId:any = searchParams.get("userId");

    if(!userId){
        return NextResponse.json({error: "User ID is required"}, {status: 400});
    }
    const result  = await db.select().from(repositories).where(eq(repositories.userId,userId??0))
    return NextResponse.json(result)
}