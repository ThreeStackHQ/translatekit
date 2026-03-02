import { NextRequest, NextResponse } from "next/server";
import { db, workspaces, projects, translationKeys, translationValues } from "@translatekit/db";
import { eq, and } from "drizzle-orm";

// In-memory rate limiter: 500 req/min per API key
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 500;
const WINDOW_MS = 60_000;

function checkRateLimit(apiKey: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(apiKey);

  if (!record || now - record.windowStart > WINDOW_MS) {
    rateLimitMap.set(apiKey, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Cleanup stale entries periodically (avoid unbounded growth)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.windowStart > WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, 120_000);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=3600",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { params: string[] } }
) {
  try {
    // Expect: /api/cdn/:projectId/:locale.json
    // params.params = ["projectId", "locale.json"]
    const segments = params.params;
    if (!segments || segments.length < 2) {
      return NextResponse.json(
        { error: "Invalid path. Expected /api/cdn/:projectId/:locale.json" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const projectId = segments[0];
    const localeSegment = segments[segments.length - 1];

    // Strip .json suffix
    const locale = localeSegment?.endsWith(".json")
      ? localeSegment.slice(0, -5)
      : localeSegment;

    if (!locale || !projectId) {
      return NextResponse.json(
        { error: "Invalid path parameters" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Verify API key
    const apiKey = req.nextUrl.searchParams.get("key");
    if (!apiKey || !apiKey.startsWith("tk_live_")) {
      return NextResponse.json(
        { error: "Missing or invalid API key. Pass ?key=tk_live_xxx" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Rate limit check
    if (!checkRateLimit(apiKey)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 500 requests/minute per key." },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    // Verify API key against workspaces
    const [workspace] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.apiKey, apiKey))
      .limit(1);

    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Verify project belongs to workspace
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.workspaceId, workspace.id)
        )
      )
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Fetch all translation keys and their values for the requested locale
    const keys = await db
      .select({
        key: translationKeys.key,
        value: translationValues.value,
      })
      .from(translationKeys)
      .innerJoin(
        translationValues,
        and(
          eq(translationValues.keyId, translationKeys.id),
          eq(translationValues.locale, locale)
        )
      )
      .where(eq(translationKeys.projectId, projectId));

    // Build flat key-value map
    const translations: Record<string, string> = {};
    for (const row of keys) {
      translations[row.key] = row.value;
    }

    return NextResponse.json(translations, {
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("[cdn] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
