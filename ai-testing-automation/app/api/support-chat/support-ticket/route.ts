import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";


export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    console.log(body);

    const {
        userId,
        subject,
        category,
        description,
            } = body;

    if (
      !userId ||
      !subject ||
      !category ||
      !description
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    const ticket =
      await db
        .insert(supportTickets)
        .values({
          userId,
          subject,
          category,
          description,
        })
        .returning();

    return NextResponse.json(
      {
        success: true,
        message:
          "Support ticket submitted successfully",
        ticket: ticket[0],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Support Ticket Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to submit support ticket",
      },
      {
        status: 500,
      }
    );
  }
}