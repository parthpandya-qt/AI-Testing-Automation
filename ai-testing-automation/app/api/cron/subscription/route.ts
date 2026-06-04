import { NextResponse } from "next/server";
import { db, users } from "@/db";
import { and, eq, lt } from "drizzle-orm";

export async function GET() {
  const now = new Date();

  const expiredUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.plan, "pro"),
        lt(users.subscriptionEnd, now)
      )
    );

  for (const user of expiredUsers) {
    await db
      .update(users)
      .set({
        plan: "free",
        subscriptionStart: null,
        subscriptionEnd: null,
      })
      .where(eq(users.id, user.id));
  }

  return NextResponse.json({
    success: true,
    updatedUsers: expiredUsers.length,
  });
}