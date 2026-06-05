import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  repositories,
  TestCasesTable,
  supportTickets,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest
) {
    console.log("REPORT API HIT");
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

    const user = await db.query.users.findFirst({
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

    const repos = await db
      .select()
      .from(repositories)
      .where(
        eq(repositories.userId, userId)
      );

    const testCases = await db
      .select()
      .from(TestCasesTable)
      .where(
        eq(
          TestCasesTable.userId,
          String(userId)
        )
      );

    const tickets = await db
      .select()
      .from(supportTickets)
      .where(
        eq(
          supportTickets.userId,
          userId
        )
      );

    return NextResponse.json({
      success: true,

      totalRepositories:
        repos.length,

      totalTestCases:
        testCases.length,

      totalSupportTickets:
        tickets.length,

      credits: user.credits,

      plan: user.plan,

      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(
      "Report API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch report data",
      },
      {
        status: 500,
      }
    );
  }
}