import { NextRequest, NextResponse } from "next/server";
import { db, workspaces, users, projects, translationKeys, translationValues, subscriptions, languages } from "@translatekit/db";
import { eq, gte, count, sql } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildDigestEmail(params: {
  workspaceName: string;
  userEmail: string;
  keysAddedThisWeek: number;
  keysTranslatedThisWeek: number;
  localeStats: Array<{ locale: string; coverage: number; missing: number }>;
  unsubscribeUrl: string;
}): string {
  const { workspaceName, keysAddedThisWeek, keysTranslatedThisWeek, localeStats, unsubscribeUrl } = params;

  const localeRows = localeStats
    .slice(0, 10)
    .map(
      ({ locale, coverage, missing }) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151">${locale.toUpperCase()}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151">
            <div style="background:#e0e7ff;border-radius:4px;height:8px;width:100%;position:relative">
              <div style="background:#4f46e5;border-radius:4px;height:8px;width:${coverage}%"></div>
            </div>
            <span style="font-size:12px;color:#6b7280">${coverage.toFixed(1)}%</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#ef4444;font-weight:600">${missing} missing</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 16px">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:32px;font-weight:800;color:#4f46e5">🌐 TranslateKit</span>
      <p style="color:#6b7280;margin:8px 0 0">Weekly Translation Digest</p>
    </div>

    <!-- Hero Card -->
    <div style="background:#4f46e5;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
      <h1 style="color:#fff;font-size:22px;margin:0 0 8px">Weekly Report for ${workspaceName}</h1>
      <p style="color:#c7d2fe;margin:0;font-size:15px">Here's what happened with your translations this week</p>
    </div>

    <!-- Stats Row -->
    <div style="display:grid;gap:16px;margin-bottom:24px">
      <div style="display:flex;gap:16px">
        <div style="flex:1;background:#fff;border-radius:12px;padding:20px;border:1px solid #e5e7eb;text-align:center">
          <div style="font-size:36px;font-weight:800;color:#4f46e5">${keysAddedThisWeek}</div>
          <div style="color:#6b7280;font-size:13px;margin-top:4px">New Keys Added</div>
        </div>
        <div style="flex:1;background:#fff;border-radius:12px;padding:20px;border:1px solid #e5e7eb;text-align:center">
          <div style="font-size:36px;font-weight:800;color:#10b981">${keysTranslatedThisWeek}</div>
          <div style="color:#6b7280;font-size:13px;margin-top:4px">Translations Added</div>
        </div>
      </div>
    </div>

    <!-- Locale Coverage Table -->
    <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:24px;overflow:hidden">
      <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;background:#f8faff">
        <h2 style="margin:0;font-size:16px;color:#1f2937;font-weight:700">📊 Coverage by Locale</h2>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase">Locale</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase">Coverage</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase">Missing</th>
          </tr>
        </thead>
        <tbody>${localeRows || '<tr><td colspan="3" style="padding:20px;text-align:center;color:#6b7280">No translations yet</td></tr>'}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px">
      <a href="https://translatekit.threestack.io/dashboard" 
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px">
        View Full Dashboard →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;padding-top:20px">
      <p style="margin:0 0 8px">TranslateKit by ThreeStack · AI-powered i18n</p>
      <p style="margin:0">
        <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline">Unsubscribe from weekly digest</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  // Verify cron secret (optional but recommended)
  const cronSecret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://translatekit.threestack.io";

  try {
    // Get all workspaces with users and subscriptions
    const allWorkspaces = await db
      .select({
        workspaceId: workspaces.id,
        workspaceName: workspaces.name,
        userId: workspaces.userId,
        userEmail: users.email,
        unsubscribeToken: subscriptions.unsubscribeToken,
        digestOptOut: subscriptions.digestOptOut,
      })
      .from(workspaces)
      .innerJoin(users, eq(users.id, workspaces.userId))
      .leftJoin(subscriptions, eq(subscriptions.workspaceId, workspaces.id));

    let sent = 0;
    let skipped = 0;

    for (const workspace of allWorkspaces) {
      if (workspace.digestOptOut) {
        skipped++;
        continue;
      }

      try {
        // Count keys added this week
        const [keysAdded] = await db
          .select({ count: count() })
          .from(translationKeys)
          .innerJoin(projects, eq(projects.id, translationKeys.projectId))
          .where(
            sql`${projects.workspaceId} = ${workspace.workspaceId} AND ${translationKeys.createdAt} >= ${oneWeekAgo}`
          );

        // Count translations added this week
        const [translationsAdded] = await db
          .select({ count: count() })
          .from(translationValues)
          .innerJoin(translationKeys, eq(translationKeys.id, translationValues.keyId))
          .innerJoin(projects, eq(projects.id, translationKeys.projectId))
          .where(
            sql`${projects.workspaceId} = ${workspace.workspaceId} AND ${translationValues.updatedAt} >= ${oneWeekAgo}`
          );

        // Get coverage per locale
        const allLangs = await db.select({ code: languages.code }).from(languages);
        const workspaceProjects = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.workspaceId, workspace.workspaceId));

        const projectIds = workspaceProjects.map((p) => p.id);
        const totalKeys = keysAdded?.count ?? 0;

        const localeStats = [];
        for (const lang of allLangs) {
          if (projectIds.length === 0) break;

          let translated = 0;
          let total = 0;
          for (const pid of projectIds) {
            const [tk] = await db
              .select({ count: count() })
              .from(translationKeys)
              .where(eq(translationKeys.projectId, pid));
            total += tk?.count ?? 0;

            const [tv] = await db
              .select({ count: count() })
              .from(translationValues)
              .innerJoin(translationKeys, eq(translationKeys.id, translationValues.keyId))
              .where(
                sql`${translationKeys.projectId} = ${pid} AND ${translationValues.locale} = ${lang.code}`
              );
            translated += tv?.count ?? 0;
          }

          if (total === 0) continue;

          const coverage = Math.round((translated / total) * 100 * 10) / 10;
          const missing = total - translated;
          localeStats.push({ locale: lang.code, coverage, missing });
        }

        const unsubscribeUrl = workspace.unsubscribeToken
          ? `${baseUrl}/api/digest/unsubscribe?token=${workspace.unsubscribeToken}`
          : `${baseUrl}/dashboard/settings`;

        const html = buildDigestEmail({
          workspaceName: workspace.workspaceName,
          userEmail: workspace.userEmail,
          keysAddedThisWeek: keysAdded?.count ?? 0,
          keysTranslatedThisWeek: translationsAdded?.count ?? 0,
          localeStats,
          unsubscribeUrl,
        });

        await resend.emails.send({
          from: "digest@translatekit.threestack.io",
          to: workspace.userEmail,
          subject: `📊 Your Weekly Translation Report — ${workspace.workspaceName}`,
          html,
        });

        sent++;
      } catch (err) {
        console.error(`[digest] Error for workspace ${workspace.workspaceId}:`, err);
      }
    }

    return NextResponse.json({
      message: "Digest sent",
      sent,
      skipped,
      total: allWorkspaces.length,
    });
  } catch (error) {
    console.error("[digest] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
