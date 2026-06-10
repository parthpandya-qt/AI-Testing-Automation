import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = req.cookies.get(`github_token_${user.id}`)?.value || req.cookies.get("github_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const allRepo: any[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const repos = await res.json();

    allRepo.push(...repos);

    if (repos.length < 100) {
      break;
    }

    page++;
  }

  return NextResponse.json({
    repos: allRepo.map((repo)=>({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      updated_at: repo.updated_at,
      language: repo.language,
      default_branch: repo.default_branch,
      owner:repo.owner.login,
      private_: repo.private
    })),
  });
}