import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let redirectUri = process.env.GITHUB_REDIRECT_URL;
  // If redirectUri is not set or points to localhost while running on a deployed domain,
  // automatically use the current deployment origin so OAuth callback returns to the deployed app!
  if (!redirectUri || (redirectUri.includes("localhost") && !req.nextUrl.origin.includes("localhost"))) {
    redirectUri = `${req.nextUrl.origin}/api/github/callback`;
  }

  const queryParams: Record<string, string> = {
    client_id: process.env.GITHUB_CLIENT_ID || "",
    scope: "repo read:user",
    prompt: "select_account",
  };

  if (redirectUri) {
    queryParams.redirect_uri = redirectUri;
  }

  const params = new URLSearchParams(queryParams);
  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(githubAuthUrl);
}
