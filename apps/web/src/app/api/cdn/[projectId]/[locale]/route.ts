/**
 * GET /api/cdn/[projectId]/[locale]
 *
 * Public CDN endpoint — serves compiled translation JSON for a given
 * project + locale pair. This endpoint is consumed by the @translatekit/sdk
 * client and any direct HTTP consumers.
 *
 * Security profile:
 *  - CORS:         Access-Control-Allow-Origin: * (public CDN endpoint)
 *  - Auth:         NONE — CDN is intentionally public by projectId + locale
 *                  (SEC-001 fix applies to authenticated API routes, NOT CDN)
 *  - Rate limit:   500 req/min per projectId (in-memory; swap for Upstash in prod)
 *  - Admin routes: MUST NOT use wildcard CORS (separate middleware)
 *
 * BUG-002 FIX: Removed Bearer auth requirement — CDN is a public endpoint.
 *   The translation JSON is public data (no secrets in translated strings).
 *   Authentication happens at project management level, not CDN serving level.
 *
 * BUG-001 FIX: Cache-Control corrected to 1 hour (3600s) per spec.
 *   Previous value was 300s (5 min) which caused excessive origin hits.
 *
 * TODO (Bolt): Implement DB lookup — verify projectId exists, fetch & return
 *              compiled translations from translation_values table.
 */

import { NextResponse } from "next/server";
import { checkRateLimit, cdnRateLimiter } from "@/lib/rate-limit";

// CORS headers for public CDN endpoint
// BUG-001 FIX: Cache-Control corrected from max-age=300 (5 min) to max-age=3600 (1 hour)
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=3600, s-maxage=3600", // 1-hour CDN cache (BUG-001 FIX)
} as const;

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: Request,
  { params }: { params: { projectId: string; locale: string } }
) {
  const { projectId, locale } = params;

  // ── Rate limiting (500/min per projectId) ─────────────────────────────────
  if (!checkRateLimit(cdnRateLimiter, projectId)) {
    return NextResponse.json(
      { error: "Too many requests. Slow down." },
      { status: 429, headers: CORS_HEADERS }
    );
  }

  // ── Input sanitization ────────────────────────────────────────────────────
  // Validate projectId and locale are safe identifiers (no path traversal)
  const SAFE_ID = /^[a-zA-Z0-9_-]{1,64}$/;
  const SAFE_LOCALE = /^[a-zA-Z]{2,5}(-[a-zA-Z]{2,4})?$/;
  if (!SAFE_ID.test(projectId) || !SAFE_LOCALE.test(locale)) {
    return NextResponse.json(
      { error: "Invalid projectId or locale." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // ── TODO: Bolt to implement ───────────────────────────────────────────────
  // 1. Query translation_values JOIN translation_keys
  //    WHERE translation_keys.projectId = projectId AND translation_values.locale = locale
  // 2. If locale not found → return 404 with fallback info
  // 3. Return as flat { "key": "value" } JSON
  // 4. Set ETag header for conditional requests (If-None-Match → 304 Not Modified)
  //
  // Fallback when locale missing:
  //   return NextResponse.json(
  //     { error: `Locale '${locale}' not found for project '${projectId}'.` },
  //     { status: 404, headers: CORS_HEADERS }
  //   );

  return NextResponse.json(
    {
      _todo: "Bolt: implement translation fetch from DB",
      projectId,
      locale,
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
