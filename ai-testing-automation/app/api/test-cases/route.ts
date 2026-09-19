import { db, TestCasesTable, repositories } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getTestCasesFromCache, setTestCasesInCache } from "@/lib/testCasesCache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");
    const refresh = searchParams.get("refresh") === "true" || searchParams.get("forceRefresh") === "true";
    const cacheControlHeader = req.headers.get("cache-control") || "";
    const bypassCache = refresh || cacheControlHeader.includes("no-cache");

    const cacheKey = repoId || "all";

    // Fast path: check in-memory cache if not bypassing (<0.01ms, 0 network/DB roundtrips)
    if (!bypassCache) {
        const cachedData = getTestCasesFromCache(user.id, cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData, {
                headers: {
                    "X-Cache": "HIT",
                    "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
                },
            });
        }
    }

    try {
        // Fast path: if repoId is "all" or omitted, return all test cases across user's repos in 1 fast query
        if (!repoId || repoId === "all") {
            const userRepos = await db.select({ repoId: repositories.repoId })
                .from(repositories)
                .where(eq(repositories.userId, user.id));

            if (userRepos.length === 0) {
                setTestCasesInCache(user.id, "all", []);
                return NextResponse.json([], {
                    headers: {
                        "X-Cache": "MISS",
                        "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
                    },
                });
            }

            const repoIds = userRepos.map(r => String(r.repoId));
            const allTestCases = await db.select()
                .from(TestCasesTable)
                .where(inArray(TestCasesTable.repoId, repoIds));

            setTestCasesInCache(user.id, "all", allTestCases);
            return NextResponse.json(allTestCases, {
                headers: {
                    "X-Cache": "MISS",
                    "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
                },
            });
        }

        // Single repo: run ownership check and test cases query in parallel
        const [repoOwnerCheck, testCases] = await Promise.all([
            db.select({ id: repositories.id })
                .from(repositories)
                .where(and(eq(repositories.repoId, Number(repoId)), eq(repositories.userId, user.id)))
                .limit(1),
            db.select()
                .from(TestCasesTable)
                .where(eq(TestCasesTable.repoId, repoId))
        ]);

        if (repoOwnerCheck.length === 0) {
            return NextResponse.json({ error: "Repository not found or forbidden" }, { status: 404 });
        }

        setTestCasesInCache(user.id, repoId, testCases);
        return NextResponse.json(testCases, {
            headers: {
                "X-Cache": "MISS",
                "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
            },
        });
    } catch (err: any) {
        console.error("Test cases API error:", err);
        return NextResponse.json({ error: "Failed to retrieve test cases" }, { status: 500 });
    }
}