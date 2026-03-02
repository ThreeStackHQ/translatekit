import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, projects, workspaces } from "@translatekit/db";
import { eq, and } from "drizzle-orm";
import { translateProjectLocale } from "@/lib/translate";
import { z } from "zod";

const translateSchema = z.object({
  projectId: z.string(),
  targetLocales: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = translateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, targetLocales } = parsed.data;

    // Verify ownership
    const [project] = await db
      .select({ id: projects.id, workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const [workspace] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(
        and(
          eq(workspaces.id, project.workspaceId),
          eq(workspaces.userId, userId)
        )
      )
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Run translations for each locale
    const results: Record<string, string> = {};
    for (const locale of targetLocales) {
      try {
        await translateProjectLocale(projectId, locale);
        results[locale] = "success";
      } catch (err) {
        console.error(`[translate] Error for ${locale}:`, err);
        results[locale] = "error";
      }
    }

    return NextResponse.json({
      message: "Translation complete",
      results,
    });
  } catch (error) {
    console.error("[translate] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
