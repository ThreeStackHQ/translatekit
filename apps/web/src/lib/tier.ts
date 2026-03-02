import { db, workspaces, subscriptions, projects } from "@translatekit/db";
import { eq, count } from "drizzle-orm";

export type Tier = "free" | "starter" | "pro";

export interface TierLimits {
  maxProjects: number;
  maxLanguages: number;
  maxKeysPerMonth: number;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    maxProjects: 2,
    maxLanguages: 5,
    maxKeysPerMonth: 1_000,
  },
  starter: {
    maxProjects: 10,
    maxLanguages: 20,
    maxKeysPerMonth: 100_000,
  },
  pro: {
    maxProjects: Infinity,
    maxLanguages: Infinity,
    maxKeysPerMonth: Infinity,
  },
};

export async function getUserTier(userId: string): Promise<Tier> {
  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.userId, userId))
    .limit(1);

  if (!workspace) return "free";

  return getWorkspaceTier(workspace.id);
}

export async function getWorkspaceTier(workspaceId: string): Promise<Tier> {
  const [sub] = await db
    .select({ tier: subscriptions.tier, status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1);

  if (!sub || sub.status !== "active") return "free";
  return (sub.tier as Tier) ?? "free";
}

export async function canCreateProject(workspaceId: string): Promise<boolean> {
  const tier = await getWorkspaceTier(workspaceId);
  const limits = TIER_LIMITS[tier];

  if (limits.maxProjects === Infinity) return true;

  const [result] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId));

  return (result?.count ?? 0) < limits.maxProjects;
}

export async function getKeyLimit(workspaceId: string): Promise<number> {
  const tier = await getWorkspaceTier(workspaceId);
  return TIER_LIMITS[tier].maxKeysPerMonth;
}

export async function getMaxLanguages(workspaceId: string): Promise<number> {
  const tier = await getWorkspaceTier(workspaceId);
  return TIER_LIMITS[tier].maxLanguages;
}
