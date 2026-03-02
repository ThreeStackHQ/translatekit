import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db, webhooks, projects, translationKeys, workspaces } from "@translatekit/db";
import { eq, and } from "drizzle-orm";
import { translateProjectLocale } from "@/lib/translate";
import { getMaxLanguages } from "@/lib/tier";

// Verify GitHub HMAC-SHA256 signature
function verifyGithubSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSig = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")}`;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSig)
    );
  } catch {
    return false;
  }
}

// Locale file path patterns
function isLocaleFile(filePath: string): boolean {
  const localePatterns = [
    /^locales\/[^/]+\.json$/,
    /^locale\/[^/]+\.json$/,
    /^i18n\/[^/]+\.json$/,
    /\/locales\/[^/]+\.json$/,
    /\/locale\/[^/]+\.json$/,
    /\/i18n\/[^/]+\.json$/,
  ];
  return localePatterns.some((pattern) => pattern.test(filePath));
}

// Extract locale code from file path (e.g., "locales/en.json" → "en")
function extractLocale(filePath: string): string | null {
  const match = filePath.match(/([^/]+)\.json$/);
  return match?.[1] ?? null;
}

// Fetch file content from GitHub API
async function fetchGithubFile(
  owner: string,
  repo: string,
  filePath: string,
  token: string
): Promise<Record<string, string> | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { content?: string; encoding?: string };
  if (!data.content || data.encoding !== "base64") return null;

  try {
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return JSON.parse(decoded) as Record<string, string>;
  } catch {
    return null;
  }
}

// Fetch file content from GitLab API
async function fetchGitlabFile(
  projectId: string,
  filePath: string,
  ref: string,
  token: string
): Promise<Record<string, string> | null> {
  const encodedPath = encodeURIComponent(filePath);
  const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${encodedPath}?ref=${ref}`;
  const res = await fetch(url, {
    headers: { "PRIVATE-TOKEN": token },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { content?: string; encoding?: string };
  if (!data.content || data.encoding !== "base64") return null;

  try {
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return JSON.parse(decoded) as Record<string, string>;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Detect provider from headers
    const githubSignature = req.headers.get("x-hub-signature-256");
    const gitlabToken = req.headers.get("x-gitlab-token");
    const provider: "github" | "gitlab" | null = githubSignature
      ? "github"
      : gitlabToken
      ? "gitlab"
      : null;

    if (!provider) {
      return NextResponse.json(
        { error: "Unknown webhook provider" },
        { status: 400 }
      );
    }

    // Parse payload
    let payload: {
      repository?: { full_name?: string; id?: number };
      commits?: Array<{ modified?: string[]; added?: string[] }>;
      ref?: string;
      project?: { id?: number };
    };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Find all matching webhooks for this provider
    const allWebhooks = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.provider, provider));

    // Find matching webhook by verifying signature
    let matchedWebhook: (typeof allWebhooks)[0] | null = null;
    for (const wh of allWebhooks) {
      if (provider === "github" && githubSignature) {
        if (verifyGithubSignature(rawBody, githubSignature, wh.secret)) {
          matchedWebhook = wh;
          break;
        }
      } else if (provider === "gitlab" && gitlabToken) {
        if (wh.secret === gitlabToken) {
          matchedWebhook = wh;
          break;
        }
      }
    }

    if (!matchedWebhook) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    // Extract changed locale files
    const changedFiles: string[] = [];
    const commits = payload.commits ?? [];
    for (const commit of commits) {
      for (const file of [...(commit.modified ?? []), ...(commit.added ?? [])]) {
        if (isLocaleFile(file)) {
          changedFiles.push(file);
        }
      }
    }

    if (changedFiles.length === 0) {
      return NextResponse.json({ message: "No locale files changed" });
    }

    // Return 200 immediately, process in background
    const projectId = matchedWebhook.projectId;
    const secret = matchedWebhook.secret;
    const repoFullName = payload.repository?.full_name ?? "";
    const ref = (payload.ref ?? "main").replace("refs/heads/", "");
    const gitlabProjectId = String(payload.project?.id ?? payload.repository?.id ?? "");

    setImmediate(async () => {
      try {
        const workspace = await db
          .select({ id: workspaces.id })
          .from(workspaces)
          .where(eq(workspaces.id, matchedWebhook!.workspaceId))
          .limit(1);

        const workspaceId = workspace[0]?.id;
        const maxLangs = workspaceId ? await getMaxLanguages(workspaceId) : 5;

        for (const filePath of changedFiles) {
          const locale = extractLocale(filePath);
          if (!locale) continue;

          let fileContent: Record<string, string> | null = null;

          if (provider === "github") {
            const [owner, repo] = repoFullName.split("/");
            if (owner && repo) {
              fileContent = await fetchGithubFile(owner, repo, filePath, secret);
            }
          } else {
            fileContent = await fetchGitlabFile(gitlabProjectId, filePath, ref, secret);
          }

          if (!fileContent) continue;

          // Upsert translation keys
          for (const [key, value] of Object.entries(fileContent)) {
            if (typeof value !== "string") continue;

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
              await db
                .update(translationKeys)
                .set({ defaultValue: value })
                .where(eq(translationKeys.id, existing[0].id));
            } else {
              await db
                .insert(translationKeys)
                .values({ projectId, key, defaultValue: value });
            }
          }

          // Re-run translation pipeline for all target languages (excluding source locale)
          const targetLocales = ["fr", "de", "es", "pt", "it", "nl", "pl", "ru", "zh", "ja", "ko", "ar", "hi", "tr", "sv", "da", "no", "fi", "cs"]
            .filter((l) => l !== locale)
            .slice(0, maxLangs);

          for (const targetLocale of targetLocales) {
            try {
              await translateProjectLocale(projectId, targetLocale);
            } catch (err) {
              console.error(`[webhook] Translation error for ${targetLocale}:`, err);
            }
          }
        }
      } catch (err) {
        console.error("[webhook] Background processing error:", err);
      }
    });

    return NextResponse.json({
      message: "Webhook received. Processing locale files in background.",
      changedFiles,
    });
  } catch (error) {
    console.error("[webhook] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
