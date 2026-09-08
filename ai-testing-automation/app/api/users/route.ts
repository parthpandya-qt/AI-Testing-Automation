import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json().catch(() => ({}));
    let email = body?.email;
    let name = body?.name;

    if (!userId) {
      // ONLY use development fallback if Clerk is NOT configured
      const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !!process.env.CLERK_SECRET_KEY;
      if (isClerkEnabled) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      try {
        let existingUsers = await db.select().from(users).limit(1);
        if (existingUsers.length === 0) {
          const defaultUser = await db
            .insert(users)
            .values({
              name: "Parth Local",
              email: "parth.pandya1307@gmail.com",
            })
            .returning();
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
        name: "Parth (Local Fallback)",
        email: "parth.pandya1307@gmail.com",
        credits: 1000,
      });
    }

    // If client didn't supply email, fallback to currentUser()
    if (!email) {
      const user = await currentUser();
      email = user?.primaryEmailAddress?.emailAddress;
      name = name || user?.fullName || user?.firstName || "User";
    }

    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (userResult.length === 0) {
      const newUser = await db
        .insert(users)
        .values({
          name: name ?? "NEW USER",
          email,
        })
        .returning();
      return NextResponse.json(newUser[0]);
    } else {
      return NextResponse.json(userResult[0]);
    }
  } catch (error: any) {
    console.error("User route error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


