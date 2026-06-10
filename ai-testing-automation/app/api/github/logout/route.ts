import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST() {
  const user = await getAuthenticatedUser();
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  const cookieName = user ? `github_token_${user.id}` : "github_token";

  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
  });

  // Also clear legacy github_token cookie just in case
  response.cookies.set("github_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
  });

  return response;
}
