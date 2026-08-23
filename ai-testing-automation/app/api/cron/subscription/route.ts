import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/db";
import { and, eq, lt, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Verify Vercel Cron Secret in production if configured
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
      req.headers.get("x-vercel-cron") !== "1"
    ) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    const now = new Date();

    // Query expired pro subscriptions using SQL date comparison
    const expiredUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.plan, "pro"),
          sql`${users.subscriptionEnd} IS NOT NULL AND ${users.subscriptionEnd} < ${now}`
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
      timestamp: now.toISOString(),
      updatedUsers: expiredUsers.length,
      expiredUserIds: expiredUsers.map((u) => u.id),
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Cron job failed" },
      { status: 500 }
    );
  }
}