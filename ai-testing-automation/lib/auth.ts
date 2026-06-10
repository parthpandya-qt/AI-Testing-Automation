import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function getAuthenticatedUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      // ONLY use development fallback if Clerk is NOT configured
      const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !!process.env.CLERK_SECRET_KEY;
      if (isClerkEnabled) {
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
