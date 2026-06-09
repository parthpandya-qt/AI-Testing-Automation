import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      success: true,
      credits: authUser.credits,
      plan: authUser.plan,
    });
  } catch (error) {
    console.error("Credits API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch credits",
      },
      {
        status: 500,
      }
    );
  }
}