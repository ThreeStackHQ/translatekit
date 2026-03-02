import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  db,
  workspaces,
  projects,
  translationKeys,
  translationValues,
} from "@translatekit/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const patchSchema = z.object({
  value: z.string().min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; locale: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const keyId = params.id;
    const locale = params.locale;

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { value } = parsed.data;

    // Get the translation key
    const [key] = await db
      .select({ id: translationKeys.id, projectId: translationKeys.projectId })
      .from(translationKeys)
      .where(eq(translationKeys.id, keyId))
      .limit(1);

    if (!key) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    // Verify ownership
    const [project] = await db
      .select({ workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, key.projectId))
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

    // Upsert translation value with verifiedAt = now()
    const now = new Date();
    const existing = await db
      .select({ id: translationValues.id })
      .from(translationValues)
      .where(
        and(
          eq(translationValues.keyId, keyId),
          eq(translationValues.locale, locale)
        )
      )
      .limit(1);

    let updatedValue;
    if (existing.length > 0) {
      const [updated] = await db
        .update(translationValues)
        .set({ value, aiGenerated: false, verifiedAt: now, updatedAt: now })
        .where(eq(translationValues.id, existing[0].id))
        .returning();
      updatedValue = updated;
    } else {
      const [inserted] = await db
        .insert(translationValues)
        .values({
          keyId,
          locale,
          value,
          aiGenerated: false,
          verifiedAt: now,
        })
        .returning();
      updatedValue = inserted;
    }

    return NextResponse.json({ data: updatedValue });
  } catch (error) {
    console.error("[values] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
