import { db } from "@/db"; 
import { users } from "@/db/schema"; 
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
   
    const urlId = req.nextUrl.searchParams.get("id");
    const userId = urlId ? Number(urlId) : null;

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing User ID parameter" },
        { status: 400 }
      );
    }
    const body = await req.json();
    const targetEmail = body?.email;

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, message: "Missing email address field in request body" },
        { status: 400 }
      );
    }


    const updatedUser = await db
      .update(users)
      .set({ 
        subscriberEmails: sql`array_append(${users.subscriberEmails}, ${targetEmail}::text)` 
      })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { success: false, message: "No active user matches the provided ID record" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Subscription array updated successfully" 
    });

  } catch (error: any) {
    console.error("Critical API Update Error Logged:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update subscription status" }, 
      { status: 500 }
    );
  }
}