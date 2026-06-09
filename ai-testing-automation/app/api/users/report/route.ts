import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  repositories,
  TestCasesTable,
  supportTickets,
} from "@/db/schema";
import { eq } from "drizzle-orm";
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

    const userId = authUser.id;

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
      totalRepositories: repos.length,
      totalTestCases: testCases.length,
      totalSupportTickets: tickets.length,
      credits: authUser.credits,
      plan: authUser.plan,
      createdAt: authUser.createdAt,
    });
  } catch (error) {
    console.error("Report API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch report data",
      },
      {
        status: 500,
      }
    );
  }
}