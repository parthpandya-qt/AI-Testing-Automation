import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST() {
  try {
    const order = await razorpay.orders.create({
      amount:  999, // $9.99
      currency: "USD",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}