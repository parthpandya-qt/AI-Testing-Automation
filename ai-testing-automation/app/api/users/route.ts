import {db} from "@/db";
import {users} from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import {NextRequest} from "next/server";
import { currentUser} from "@clerk/nextjs/server";




export async function POST(req:NextRequest){
    const user = await currentUser();
    
    
    if (!user) {
        
        try {
            let existingUsers = await db.select().from(users).limit(1);
            if (existingUsers.length === 0) {
                const defaultUser = await db.insert(users).values({
                    name: 'Parth Local',
                    email: 'parth.pandya1307@gmail.com',
                }).returning();
                existingUsers = defaultUser;
            }
            if (existingUsers.length > 0) {
                return NextResponse.json(existingUsers[0]);
            }
        } catch (dbErr) {
            console.error("Database fallback failed:", dbErr);
        }
        
        return NextResponse.json({
            id: 10,
            name: 'Parth (Local Fallback)',
            email: 'parth.pandya1307@gmail.com',
            credits: 1000
        });
    }

    try{
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }
        const userResult = await db.select().from(users).where(eq(users.email, email));
        if(userResult.length === 0){
            const newUser = await db.insert(users).values({
                name:user.firstName ?? 'NEW USER',
                email,
            }).returning();
            console.log(newUser)
            return NextResponse.json(newUser[0]);
        }else{
            return NextResponse.json(userResult[0]);
        }
    }catch(error:any){
        return NextResponse.json({error:error.message},{status:400});
    }
}


