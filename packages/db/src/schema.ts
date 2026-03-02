import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import crypto from "crypto";

// ──────────────────────────────────────────────
// users
// ──────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// workspaces
// ──────────────────────────────────────────────
export const workspaces = pgTable("workspaces", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  // tk_live_ + 32 bytes hex = 72 chars total
  apiKey: text("api_key")
    .notNull()
    .unique()
    .$defaultFn(() => `tk_live_${crypto.randomBytes(32).toString("hex")}`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// projects
// ──────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  defaultLocale: varchar("default_locale", { length: 10 }).notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// locale_files  (user-uploaded source JSONs)
// ──────────────────────────────────────────────
export const localeFiles = pgTable("locale_files", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  locale: varchar("locale", { length: 10 }).notNull(),
  rawJson: jsonb("raw_json").notNull(), // the uploaded flat key-value object
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// translation_keys
// ──────────────────────────────────────────────
export const translationKeys = pgTable("translation_keys", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  key: text("key").notNull(),            // e.g. "auth.login.button"
  defaultValue: text("default_value"),   // source language value
  context: text("context"),              // hint for AI translator
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// translation_values
// ──────────────────────────────────────────────
export const translationValues = pgTable("translation_values", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  keyId: text("key_id")
    .notNull()
    .references(() => translationKeys.id, { onDelete: "cascade" }),
  locale: varchar("locale", { length: 10 }).notNull(),
  value: text("value").notNull(),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  verifiedAt: timestamp("verified_at"),  // null = unverified
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// languages  (static seed — 20 supported locales)
// ──────────────────────────────────────────────
export const languages = pgTable("languages", {
  code: varchar("code", { length: 10 }).primaryKey(), // e.g. "fr"
  name: varchar("name", { length: 100 }).notNull(),   // e.g. "French"
  nativeName: varchar("native_name", { length: 100 }).notNull(), // e.g. "Français"
});

export const SEED_LANGUAGES = [
  { code: "en", name: "English",    nativeName: "English"    },
  { code: "fr", name: "French",     nativeName: "Français"   },
  { code: "de", name: "German",     nativeName: "Deutsch"    },
  { code: "es", name: "Spanish",    nativeName: "Español"    },
  { code: "pt", name: "Portuguese", nativeName: "Português"  },
  { code: "it", name: "Italian",    nativeName: "Italiano"   },
  { code: "nl", name: "Dutch",      nativeName: "Nederlands" },
  { code: "pl", name: "Polish",     nativeName: "Polski"     },
  { code: "ru", name: "Russian",    nativeName: "Русский"    },
  { code: "ja", name: "Japanese",   nativeName: "日本語"     },
  { code: "ko", name: "Korean",     nativeName: "한국어"     },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "中文"  },
  { code: "ar", name: "Arabic",     nativeName: "العربية"   },
  { code: "tr", name: "Turkish",    nativeName: "Türkçe"     },
  { code: "sv", name: "Swedish",    nativeName: "Svenska"    },
  { code: "da", name: "Danish",     nativeName: "Dansk"      },
  { code: "fi", name: "Finnish",    nativeName: "Suomi"      },
  { code: "nb", name: "Norwegian",  nativeName: "Norsk"      },
  { code: "cs", name: "Czech",      nativeName: "Čeština"    },
  { code: "hu", name: "Hungarian",  nativeName: "Magyar"     },
] as const;

// ──────────────────────────────────────────────
// webhooks
// ──────────────────────────────────────────────
export const webhooks = pgTable("webhooks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  secret: text("secret").notNull()
    .$defaultFn(() => crypto.randomBytes(32).toString("hex")),
  events: jsonb("events").notNull().default(["push"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// subscriptions
// ──────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripePriceId: text("stripe_price_id"),
  tier: varchar("tier", { length: 20 }).notNull().default("free"), // free | starter | pro
  status: varchar("status", { length: 20 }).notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end"),
});

// ──────────────────────────────────────────────
// Relations
// ──────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, { fields: [workspaces.userId], references: [users.id] }),
  projects: many(projects),
  webhooks: many(webhooks),
  subscription: one(subscriptions, {
    fields: [workspaces.id],
    references: [subscriptions.workspaceId],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  localeFiles: many(localeFiles),
  translationKeys: many(translationKeys),
  webhooks: many(webhooks),
}));

export const translationKeysRelations = relations(translationKeys, ({ one, many }) => ({
  project: one(projects, {
    fields: [translationKeys.projectId],
    references: [projects.id],
  }),
  values: many(translationValues),
}));

export const translationValuesRelations = relations(translationValues, ({ one }) => ({
  key: one(translationKeys, {
    fields: [translationValues.keyId],
    references: [translationKeys.id],
  }),
}));
