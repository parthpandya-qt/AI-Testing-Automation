import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { subject, category, description } = body;

    if (!subject || !category || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    const ticket = await db
      .insert(supportTickets)
      .values({
        userId: authUser.id, // Enforce authenticated user's ID
        subject,
        category,
        description,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Support ticket submitted successfully",
        ticket: ticket[0],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Support Ticket Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit support ticket",
      },
      {
        status: 500,
      }
    );
  }
}