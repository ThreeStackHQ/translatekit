import OpenAI from "openai";
import { db, translationKeys, translationValues } from "@translatekit/db";
import { eq, and, inArray } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BATCH_SIZE = 20;

const SYSTEM_PROMPT = `You are a professional translator. Translate the following JSON keys into {locale}. 
Return only valid JSON with the same keys. 
Preserve technical terms, variables like {name} or %s, and HTML tags.
Do not translate variable placeholders or HTML tags.`;

/**
 * Translate a batch of key-value pairs into a target locale
 */
async function translateBatch(
  keyValues: Record<string, string>,
  targetLocale: string
): Promise<Record<string, string>> {
  const prompt = SYSTEM_PROMPT.replace("{locale}", targetLocale);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Translate this JSON into ${targetLocale}:\n${JSON.stringify(keyValues, null, 2)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  return JSON.parse(content) as Record<string, string>;
}

/**
 * Translate all keys in a project for a given target locale
 */
export async function translateProjectLocale(
  projectId: string,
  targetLocale: string
): Promise<void> {
  // Get all translation keys for this project
  const keys = await db
    .select()
    .from(translationKeys)
    .where(eq(translationKeys.projectId, projectId));

  if (keys.length === 0) return;

  // Build key-value map from defaultValue
  const keyValueMap: Record<string, string> = {};
  for (const k of keys) {
    if (k.defaultValue) {
      keyValueMap[k.key] = k.defaultValue;
    }
  }

  if (Object.keys(keyValueMap).length === 0) return;

  // Process in batches of BATCH_SIZE
  const entries = Object.entries(keyValueMap);
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = Object.fromEntries(entries.slice(i, i + BATCH_SIZE));
    const translated = await translateBatch(batch, targetLocale);

    // Upsert translations
    for (const key of keys) {
      if (key.key in translated && translated[key.key]) {
        const value = String(translated[key.key]);

        // Check if a value already exists for this key+locale
        const existing = await db
          .select({ id: translationValues.id })
          .from(translationValues)
          .where(
            and(
              eq(translationValues.keyId, key.id),
              eq(translationValues.locale, targetLocale)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Update existing (only if not manually verified)
          await db
            .update(translationValues)
            .set({ value, aiGenerated: true, updatedAt: new Date() })
            .where(eq(translationValues.id, existing[0].id));
        } else {
          // Insert new
          await db.insert(translationValues).values({
            keyId: key.id,
            locale: targetLocale,
            value,
            aiGenerated: true,
          });
        }
      }
    }
  }
}

/**
 * Translate specific keys for multiple locales
 */
export async function translateKeys(
  keyIds: string[],
  targetLocales: string[]
): Promise<void> {
  if (keyIds.length === 0 || targetLocales.length === 0) return;

  const keys = await db
    .select()
    .from(translationKeys)
    .where(inArray(translationKeys.id, keyIds));

  const keyValueMap: Record<string, string> = {};
  for (const k of keys) {
    if (k.defaultValue) {
      keyValueMap[k.key] = k.defaultValue;
    }
  }

  if (Object.keys(keyValueMap).length === 0) return;

  for (const targetLocale of targetLocales) {
    const entries = Object.entries(keyValueMap);
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = Object.fromEntries(entries.slice(i, i + BATCH_SIZE));
      try {
        const translated = await translateBatch(batch, targetLocale);

        for (const key of keys) {
          if (key.key in translated && translated[key.key]) {
            const value = String(translated[key.key]);

            const existing = await db
              .select({ id: translationValues.id })
              .from(translationValues)
              .where(
                and(
                  eq(translationValues.keyId, key.id),
                  eq(translationValues.locale, targetLocale)
                )
              )
              .limit(1);

            if (existing.length > 0) {
              await db
                .update(translationValues)
                .set({ value, aiGenerated: true, updatedAt: new Date() })
                .where(eq(translationValues.id, existing[0].id));
            } else {
              await db.insert(translationValues).values({
                keyId: key.id,
                locale: targetLocale,
                value,
                aiGenerated: true,
              });
            }
          }
        }
      } catch (err) {
        console.error(`[translate] Error translating to ${targetLocale}:`, err);
      }
    }
  }
}
