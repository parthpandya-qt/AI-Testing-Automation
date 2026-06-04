


import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "User id is required" },
      { status: 400 }
    );
  }

  const data = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(id)));

  return NextResponse.json(data);
}