import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestedId = req.nextUrl.searchParams.get("id");
    const targetId = requestedId ? Number(requestedId) : authUser.id;

    if (targetId !== authUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await db
      .select()
      .from(users)
      .where(eq(users.id, targetId));

    if (data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error("Fetch user plan error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch user plan" },
      { status: 500 }
    );
  }
}