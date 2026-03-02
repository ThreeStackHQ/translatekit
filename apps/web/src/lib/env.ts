/**
 * Startup environment variable validation.
 * Throws at import time if any required variable is missing.
 * Import this in layout.tsx or instrumentation.ts to fail fast.
 */

const required = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "OPENAI_API_KEY",
  "RESEND_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CDN_BASE_URL",
] as const;

type EnvKey = (typeof required)[number];

function validateEnv(): Record<EnvKey, string> {
  const missing: string[] = [];
  const env: Partial<Record<EnvKey, string>> = {};

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      env[key] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ TranslateKit: Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nSee .env.example for reference.`
    );
  }

  return env as Record<EnvKey, string>;
}

// Validate on server side only (not in edge/browser contexts)
export const env =
  typeof process !== "undefined" && process.env.NEXT_RUNTIME !== "edge"
    ? validateEnv()
    : ({} as Record<EnvKey, string>);

// Export individual vars for convenience
export const {
  DATABASE_URL,
  NEXTAUTH_SECRET,
  OPENAI_API_KEY,
  RESEND_API_KEY,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  CDN_BASE_URL,
} = env;
