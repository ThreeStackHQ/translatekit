/**
 * GET /api/cdn/[projectId]/[locale]
 *
 * Public CDN endpoint — serves compiled translation JSON for a given
 * project + locale pair. This endpoint is consumed by the @translatekit/sdk
 * client and any direct HTTP consumers.
 *
 * Security profile:
 *  - CORS:         Access-Control-Allow-Origin: * (public CDN endpoint)
 *  - Auth:         Authorization: Bearer <api_key> (NOT query param — SEC-001)
 *  - Rate limit:   500 req/min per projectId (in-memory; swap for Upstash in prod)
 *  - Admin routes: MUST NOT use wildcard CORS (separate middleware)
 *
 * TODO (Bolt): Implement DB lookup — validate api_key → workspace,
 *              verify projectId belongs to workspace, fetch & return
 *              compiled translations from translation_values table.
 */

import { NextResponse } from "next/server";
import { checkRateLimit, cdnRateLimiter } from "@/lib/rate-limit";

// CORS headers for public CDN endpoint
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Cache-Control": "public, max-age=300, s-maxage=300", // 5-min CDN cache
} as const;

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  request: Request,
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

  // ── Auth: Bearer token in Authorization header (NOT query param) ──────────
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header. Use: Authorization: Bearer <api_key>" },
      { status: 401, headers: CORS_HEADERS }
    );
  }
  const apiKey = authHeader.slice(7).trim();

  if (!apiKey || !apiKey.startsWith("tk_live_")) {
    return NextResponse.json(
      { error: "Invalid API key format." },
      { status: 401, headers: CORS_HEADERS }
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
  // 1. Look up apiKey in DB (workspaces.apiKey) — use constant-time comparison
  // 2. Verify projectId belongs to the workspace
  // 3. Fetch compiled translations from translation_values JOIN translation_keys
  //    WHERE translation_keys.projectId = projectId AND translation_values.locale = locale
  // 4. Return as flat { "key": "value" } JSON
  // 5. Set ETag header for conditional requests

  return NextResponse.json(
    {
      _todo: "Bolt: implement translation fetch from DB",
      projectId,
      locale,
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
