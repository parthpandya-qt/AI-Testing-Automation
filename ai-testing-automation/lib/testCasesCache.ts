interface CacheEntry<T = any> {
  data: T;
  createdAt: number;
  expiresAt: number;
}

// In-memory test cases cache: `${userId}:${repoId}` -> CacheEntry
// Default TTL is 60 seconds (1 minute) for sub-millisecond retrieval (<0.1ms)
const testCasesCache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 60 * 1000;
const MAX_CACHE_ENTRIES = 1000;

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of testCasesCache.entries()) {
    if (now >= entry.expiresAt) {
      testCasesCache.delete(key);
    }
  }
}

/**
 * Retrieve cached test cases for a specific user and repository (or 'all').
 */
export function getTestCasesFromCache<T = any>(
  userId: string | number | null | undefined,
  repoId: string | number | null | undefined = "all"
): T | null {
  if (!userId) return null;
  const key = `${userId}:${repoId || "all"}`;
  const entry = testCasesCache.get(key);
  if (!entry) return null;

  if (Date.now() >= entry.expiresAt) {
    testCasesCache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Store test cases in the in-memory cache with an optional custom TTL.
 */
export function setTestCasesInCache<T = any>(
  userId: string | number | null | undefined,
  repoId: string | number | null | undefined = "all",
  data: T,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  if (!userId) return;

  if (testCasesCache.size >= MAX_CACHE_ENTRIES) {
    cleanupExpired();
    if (testCasesCache.size >= MAX_CACHE_ENTRIES) {
      // Evict oldest entry if still at capacity
      const oldestKey = testCasesCache.keys().next().value;
      if (oldestKey) testCasesCache.delete(oldestKey);
    }
  }

  const key = `${userId}:${repoId || "all"}`;
  const now = Date.now();
  testCasesCache.set(key, {
    data,
    createdAt: now,
    expiresAt: now + ttlMs,
  });
}

/**
 * Invalidate cached test cases.
 * - If userId and repoId are provided: invalidates both the single repo and the 'all' aggregated cache for that user.
 * - If only repoId is provided: invalidates that repo and all aggregated caches across users.
 * - If only userId is provided: invalidates all cache entries for that user.
 * - If neither is provided: clears the entire cache.
 */
export function invalidateTestCasesCache(
  userId?: string | number | null,
  repoId?: string | number | null
): void {
  if (!userId && (repoId === undefined || repoId === null)) {
    testCasesCache.clear();
    return;
  }

  if (!userId && repoId !== undefined && repoId !== null) {
    const rId = String(repoId);
    for (const key of testCasesCache.keys()) {
      if (key.endsWith(`:${rId}`) || key.endsWith(":all")) {
        testCasesCache.delete(key);
      }
    }
    return;
  }

  const uId = String(userId);
  if (repoId !== undefined && repoId !== null) {
    const rId = String(repoId);
    testCasesCache.delete(`${uId}:${rId}`);
    testCasesCache.delete(`${uId}:all`);
  } else {
    for (const key of testCasesCache.keys()) {
      if (key.startsWith(`${uId}:`)) {
        testCasesCache.delete(key);
      }
    }
  }
}
