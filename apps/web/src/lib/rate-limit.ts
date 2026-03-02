/**
 * In-memory rate limiter utility.
 *
 * CDN endpoints require 500 req/min per projectId (see SEC requirement).
 * Dashboard/admin API endpoints should be tighter (e.g., 60 req/min per user).
 *
 * NOTE: This in-memory implementation is suitable for single-process dev/test.
 * Production MUST use Upstash Redis (or similar) for multi-replica support.
 * Replace this module with an Upstash `@upstash/ratelimit` adapter before launch.
 */

export interface RateLimiter {
  limit: number;
  windowMs: number;
  store: Map<string, { count: number; resetAt: number }>;
}

/**
 * Create a rate limiter instance.
 * @param limit  - Max requests per window
 * @param windowMs - Window duration in milliseconds
 */
export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  return {
    limit,
    windowMs,
    store: new Map(),
  };
}

/**
 * Check whether a request from `key` is within the rate limit.
 * Returns true if allowed, false if rate-limited.
 *
 * @param limiter - RateLimiter instance (from createRateLimiter)
 * @param key     - Unique identifier (e.g., projectId, userId, IP)
 */
export function checkRateLimit(limiter: RateLimiter, key: string): boolean {
  const now = Date.now();
  const entry = limiter.store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    limiter.store.set(key, { count: 1, resetAt: now + limiter.windowMs });
    return true;
  }

  if (entry.count >= limiter.limit) {
    return false; // Rate-limited
  }

  entry.count += 1;
  return true;
}

// ─── Pre-built limiters ───────────────────────────────────────────────────────

/** CDN endpoint: 500 req/min per projectId */
export const cdnRateLimiter = createRateLimiter(500, 60 * 1000);

/** Admin/dashboard API: 60 req/min per userId */
export const adminRateLimiter = createRateLimiter(60, 60 * 1000);
