import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  db,
  workspaces,
  projects,
  translationKeys,
  localeFiles,
  languages,
} from "@translatekit/db";
import { eq, and } from "drizzle-orm";
import { translateProjectLocale } from "@/lib/translate";
import { getKeyLimit, getMaxLanguages, getWorkspaceTier } from "@/lib/tier";
import { z } from "zod";

const uploadSchema = z.record(z.string(), z.string());

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const projectId = params.id;

    // Verify project exists and belongs to user's workspace
    const [project] = await db
      .select({ id: projects.id, workspaceId: projects.workspaceId, defaultLocale: projects.defaultLocale })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify workspace belongs to user
    const [workspace] = await db
      .select({ id: workspaces.id, userId: workspaces.userId })
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

    // Parse body
    const body = await req.json();
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Body must be a flat JSON object with string values" },
        { status: 400 }
      );
    }

    const keyValues = parsed.data;
    const keyCount = Object.keys(keyValues).length;

    if (keyCount === 0) {
      return NextResponse.json({ error: "Empty locale file" }, { status: 400 });
    }

    // Check key limit (tier enforcement)
    const keyLimit = await getKeyLimit(workspace.id);
    if (keyCount > keyLimit && keyLimit !== Infinity) {
      return NextResponse.json(
        {
          error: `Key limit exceeded. Your plan allows ${keyLimit} keys/month.`,
          limit: keyLimit,
          provided: keyCount,
        },
        { status: 429 }
      );
    }

    // Store locale file record
    const locale = (req.nextUrl.searchParams.get("locale") ?? project.defaultLocale) || "en";
    await db
      .insert(localeFiles)
      .values({
        projectId,
        locale,
        rawJson: keyValues,
      })
      .onConflictDoNothing();

    // Upsert translation keys
    const insertedKeyIds: string[] = [];
    for (const [key, value] of Object.entries(keyValues)) {
      const existing = await db
        .select({ id: translationKeys.id })
        .from(translationKeys)
        .where(
          and(
            eq(translationKeys.projectId, projectId),
            eq(translationKeys.key, key)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update default value
        await db
          .update(translationKeys)
          .set({ defaultValue: value })
          .where(eq(translationKeys.id, existing[0].id));
        insertedKeyIds.push(existing[0].id);
      } else {
        const [inserted] = await db
          .insert(translationKeys)
          .values({ projectId, key, defaultValue: value })
          .returning({ id: translationKeys.id });
        if (inserted) insertedKeyIds.push(inserted.id);
      }
    }

    // Get target locales (all supported languages except source locale)
    const maxLangs = await getMaxLanguages(workspace.id);
    const allLangs = await db.select().from(languages);
    const targetLocales = allLangs
      .filter((l) => l.code !== locale)
      .slice(0, maxLangs === Infinity ? allLangs.length : maxLangs)
      .map((l) => l.code);

    // Trigger AI translation in background
    setImmediate(async () => {
      for (const targetLocale of targetLocales) {
        try {
          await translateProjectLocale(projectId, targetLocale);
        } catch (err) {
          console.error(`[upload] Translation error for ${targetLocale}:`, err);
        }
      }
    });

    return NextResponse.json({
      message: "Upload successful. AI translation triggered.",
      keysUploaded: keyCount,
      keysProcessed: insertedKeyIds.length,
      targetLocales,
    });
  } catch (error) {
    console.error("[upload] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
