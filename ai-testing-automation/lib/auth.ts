import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// In-memory authentication cache: Clerk userId -> DB User object (5-minute TTL)
const authUserCache = new Map<string, { user: typeof users.$inferSelect; expiresAt: number }>();

export function invalidateAuthUserCache(userId?: string | number | null) {
  if (!userId) {
    authUserCache.clear();
    return;
  }

  const userIdStr = String(userId);
  authUserCache.delete(userIdStr);

  for (const [key, entry] of authUserCache.entries()) {
    if (String(entry.user.id) === userIdStr || key === userIdStr) {
      authUserCache.delete(key);
    }
  }
}

export function updateAuthUserCachedCredits(userId: string | number, newCredits: number) {
  const userIdStr = String(userId);
  for (const [key, entry] of authUserCache.entries()) {
    if (String(entry.user.id) === userIdStr || key === userIdStr) {
      entry.user.credits = newCredits;
    }
  }
}

export async function getAuthenticatedUser() {
  try {
    let isTestBypass = false;
    try {
      const headersStore = await headers();
      isTestBypass = headersStore.get("x-test-bypass") === "true";
    } catch (e) {
      // headers() can throw in non-request context (e.g. static generation)
    }

    const { userId } = await auth();

    // Fast path: check in-memory cache (takes <0.01ms, 0 network requests)
    if (userId && authUserCache.has(userId)) {
      const cached = authUserCache.get(userId)!;
      if (Date.now() < cached.expiresAt) {
        return cached.user;
      }
      authUserCache.delete(userId);
    }

    if (!userId) {
      // ONLY use development fallback if Clerk is NOT configured (or during test bypass)
      const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !!process.env.CLERK_SECRET_KEY;
      if (isClerkEnabled && !isTestBypass) {
        return null;
      }

      // Development fallback cache
      if (authUserCache.has("__dev_fallback__")) {
        const cached = authUserCache.get("__dev_fallback__")!;
        if (Date.now() < cached.expiresAt) return cached.user;
      }

      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        authUserCache.set("__dev_fallback__", { user: existingUsers[0], expiresAt: Date.now() + 5 * 60 * 1000 });
        return existingUsers[0];
      }
      
      const defaultUser = await db.insert(users).values({
        name: "Parth (Local Fallback)",
        email: "parth.pandya1307@gmail.com",
      }).returning();
      
      authUserCache.set("__dev_fallback__", { user: defaultUser[0], expiresAt: Date.now() + 5 * 60 * 1000 });
      return defaultUser[0];
    }

    // Resolve Clerk user details once
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (!email) {
      return null;
    }

    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let resolvedUser: typeof users.$inferSelect;

    if (userResult.length === 0) {
      // Auto-register Clerk user in local DB if not already present
      const newUser = await db.insert(users).values({
        name: clerkUser.firstName ?? "NEW USER",
        email,
      }).returning();
      resolvedUser = newUser[0];
    } else {
      resolvedUser = userResult[0];
    }

    // Cache user for 5 minutes so all subsequent API calls are instantaneous (<0.1ms)
    authUserCache.set(userId, { user: resolvedUser, expiresAt: Date.now() + 5 * 60 * 1000 });
    return resolvedUser;
  } catch (error) {
    console.error("Authentication helper error:", error);
    return null;
  }
}

