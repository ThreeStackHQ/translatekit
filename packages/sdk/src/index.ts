/**
 * @translatekit/sdk
 * Vanilla JS CDN client for TranslateKit.
 *
 * Usage (CDN):
 *   <script src="https://cdn.translatekit.io/sdk.js"></script>
 *   <script>
 *     const tk = TranslateKit.init({ projectId: 'proj_xxx', apiKey: 'tk_live_xxx', locale: 'fr' });
 *     tk.ready().then(() => console.log(tk.t('auth.login.button'))); // "Se connecter"
 *   </script>
 *
 * Usage (ESM):
 *   import { init } from '@translatekit/sdk';
 *   const tk = init({ projectId: '...', apiKey: '...', locale: 'fr' });
 */

export interface TranslateKitConfig {
  projectId: string;
  apiKey: string;
  locale: string;
  cdnBase?: string;
  cacheTtlMs?: number;
}

export interface TranslateKitInstance {
  ready: () => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
  setLocale: (locale: string) => Promise<void>;
  getLocale: () => string;
}

const DEFAULT_CDN_BASE = "https://translatekit.threestack.io";
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

function storageKey(projectId: string, locale: string): string {
  return `tk:${projectId}:${locale}`;
}

function storageTimestampKey(projectId: string, locale: string): string {
  return `tk:${projectId}:${locale}:ts`;
}

function getCached(
  projectId: string,
  locale: string,
  ttlMs: number
): Record<string, string> | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const ts = localStorage.getItem(storageTimestampKey(projectId, locale));
    if (!ts) return null;
    if (Date.now() - parseInt(ts, 10) > ttlMs) return null;
    const raw = localStorage.getItem(storageKey(projectId, locale));
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

function setCache(
  projectId: string,
  locale: string,
  data: Record<string, string>
): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(storageKey(projectId, locale), JSON.stringify(data));
    localStorage.setItem(
      storageTimestampKey(projectId, locale),
      String(Date.now())
    );
  } catch {
    // Quota exceeded — silently ignore
  }
}

async function fetchTranslations(
  cdnBase: string,
  projectId: string,
  locale: string,
  apiKey: string
): Promise<Record<string, string>> {
  const url = `${cdnBase}/api/cdn/${projectId}/${locale}.json?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `TranslateKit: failed to fetch translations (${res.status})`
    );
  }
  return res.json() as Promise<Record<string, string>>;
}

function interpolate(
  template: string,
  params?: Record<string, string>
): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] ?? `{{${key}}}`);
}

export function init(config: TranslateKitConfig): TranslateKitInstance {
  const {
    projectId,
    apiKey,
    cdnBase = DEFAULT_CDN_BASE,
    cacheTtlMs = DEFAULT_TTL_MS,
  } = config;

  let locale = config.locale;
  let translations: Record<string, string> = {};
  let loadPromise: Promise<void> | null = null;

  async function load(targetLocale: string): Promise<void> {
    // Check cache first
    const cached = getCached(projectId, targetLocale, cacheTtlMs);
    if (cached) {
      translations = cached;
      return;
    }

    const data = await fetchTranslations(cdnBase, projectId, targetLocale, apiKey);
    setCache(projectId, targetLocale, data);
    translations = data;
  }

  loadPromise = load(locale);

  return {
    ready: () => loadPromise!,

    t(key: string, params?: Record<string, string>): string {
      const value = translations[key];
      if (value === undefined) {
        // Return key as fallback (never crash)
        return interpolate(key, params);
      }
      return interpolate(value, params);
    },

    async setLocale(newLocale: string): Promise<void> {
      locale = newLocale;
      loadPromise = load(newLocale);
      await loadPromise;
    },

    getLocale(): string {
      return locale;
    },
  };
}

// Browser global for CDN script tag usage
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>)["TranslateKit"] = { init };
}
