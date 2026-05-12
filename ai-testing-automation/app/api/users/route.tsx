import {db} from "@/db";
import {users} from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import {NextRequest} from "next/server";
import { currentUser} from "@clerk/nextjs/server";




export async function POST(req:NextRequest){
    const user = await currentUser();
    try{
        const userResult = await db.select().from(users).where(eq(users.email,user?.primaryEmailAddress?.emailAddress ?? ''));
        if(userResult.length === 0){
            const newUser = await db.insert(users).values({
                name:user?.firstName ?? 'NEW USER',
                email:user?.primaryEmailAddress?.emailAddress ?? '',
            }).returning();
            return NextResponse.json(newUser[0]);
        }else{
            return NextResponse.json(userResult[0]);
        }
    }catch(error:any){NextResponse.json({error:error.message},{status:400})}
}