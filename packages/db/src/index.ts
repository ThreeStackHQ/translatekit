import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Re-export schema and types
export * from "./schema";
export type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Convenience type aliases
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Workspace = typeof schema.workspaces.$inferSelect;
export type NewWorkspace = typeof schema.workspaces.$inferInsert;
export type Project = typeof schema.projects.$inferSelect;
export type NewProject = typeof schema.projects.$inferInsert;
export type LocaleFile = typeof schema.localeFiles.$inferSelect;
export type TranslationKey = typeof schema.translationKeys.$inferSelect;
export type TranslationValue = typeof schema.translationValues.$inferSelect;
export type Language = typeof schema.languages.$inferSelect;
export type Webhook = typeof schema.webhooks.$inferSelect;
export type Subscription = typeof schema.subscriptions.$inferSelect;
