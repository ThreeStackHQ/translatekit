import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, workspaces, projects, translationKeys, translationValues } from "@translatekit/db";
import { eq, and, isNotNull, isNull } from "drizzle-orm";

const PAGE_SIZE = 50;

export async function GET(
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
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const locale = searchParams.get("locale") ?? undefined;
    const verifiedStr = searchParams.get("verified");
    const verified = verifiedStr === "true" ? true : verifiedStr === "false" ? false : undefined;

    // Verify project ownership
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

    // Get all keys for this project
    const keys = await db
      .select()
      .from(translationKeys)
      .where(eq(translationKeys.projectId, projectId))
      .offset((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    // Fetch translation values for each key
    const result = await Promise.all(
      keys.map(async (key) => {
        let valuesQuery = db
          .select()
          .from(translationValues)
          .where(eq(translationValues.keyId, key.id));

        // Filter by locale if specified
        if (locale) {
          valuesQuery = db
            .select()
            .from(translationValues)
            .where(
              and(
                eq(translationValues.keyId, key.id),
                eq(translationValues.locale, locale)
              )
            );
        }

        let values = await valuesQuery;

        // Filter by verified status
        if (verified === true) {
          values = values.filter((v) => v.verifiedAt !== null);
        } else if (verified === false) {
          values = values.filter((v) => v.verifiedAt === null);
        }

        return { ...key, values };
      })
    );

    return NextResponse.json({
      data: result,
      page,
      pageSize: PAGE_SIZE,
      hasMore: keys.length === PAGE_SIZE,
    });
  } catch (error) {
    console.error("[keys] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
