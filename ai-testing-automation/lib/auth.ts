import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";


export async function getAuthenticatedUser() {
  try {
    let isTestBypass = false;
    try {
      const headersStore = await headers();
      isTestBypass = headersStore.get("x-test-bypass") === "true";
    } catch (e) {
      // headers() can throw in non-request context (e.g. static generation)
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      // ONLY use development fallback if Clerk is NOT configured (or during test bypass)
      const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !!process.env.CLERK_SECRET_KEY;
      if (isClerkEnabled && !isTestBypass) {
        return null;
      }

      // Development fallback
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        return existingUsers[0];
      }
      
      // Fallback user if database is empty
      const defaultUser = await db.insert(users).values({
        name: "Parth (Local Fallback)",
        email: "parth.pandya1307@gmail.com",
      }).returning();
      
      return defaultUser[0];
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (!email) {
      return null;
    }

    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userResult.length === 0) {
      // Auto-register Clerk user in local DB if not already present
      const newUser = await db.insert(users).values({
        name: clerkUser.firstName ?? "NEW USER",
        email,
      }).returning();
      return newUser[0];
    }

    return userResult[0];
  } catch (error) {
    console.error("Authentication helper error:", error);
    return null;
  }
}
