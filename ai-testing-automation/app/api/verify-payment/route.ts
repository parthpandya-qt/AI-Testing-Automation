import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_TEST_SECRET!
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const isValid =
      generatedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    // TODO:
    // Update user plan to PRO
    // Save payment details to database
    const user = await currentUser();

    if (!user?.emailAddresses[0]?.emailAddress) {
        return NextResponse.json(
        { success: false },
        { status: 401 }
        );
        }

await db
  .update(users)
  .set({
    plan: "pro",
    credits: 10000,
    subscriptionStart: new Date(),
    subscriptionEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)) 
  })
  .where(
    eq(
      users.email,
      user.emailAddresses[0].emailAddress
    )
  );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}