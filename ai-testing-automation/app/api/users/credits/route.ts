import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest
) {
  try {
    const userId = Number(
      req.nextUrl.searchParams.get("userId")
    );

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      credits: user.credits,
      plan: user.plan,
    });
  } catch (error) {
    console.error(
      "Credits API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch credits",
      },
      {
        status: 500,
      }
    );
  }
}