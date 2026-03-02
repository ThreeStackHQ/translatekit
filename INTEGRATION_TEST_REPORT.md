# TranslateKit Integration Test Report

**Sprint:** 3.4  
**Date:** 2026-03-02  
**Tested by:** Sage 🧠  
**Branch:** main  
**Repo:** https://github.com/ThreeStackHQ/translatekit  
**Method:** Static code analysis — full source trace of all integration paths

---

## Summary

| Flow | Status | Bugs Found | Notes |
|------|--------|------------|-------|
| Flow 1: Project Setup | ⚠️ PARTIAL | 0 bugs (schema ✅, API routes pending) | Bolt must implement `/api/auth/signup`, workspace/subscription auto-create |
| Flow 2: Translation AI | ⚠️ PARTIAL | 0 bugs (env guard ✅, route pending) | Bolt must implement `/api/translations/translate` |
| Flow 3: CDN Serving | ✅ FIXED | 2 bugs → FIXED (BUG-001, BUG-002) | Cache 5min→1h, removed false auth gate |
| Flow 4: Git Webhook | ⚠️ PARTIAL | 0 bugs (schema ✅, route pending) | Bolt must implement `/api/webhooks/[provider]` |
| Flow 5: Stripe Billing | ⚠️ PARTIAL | 0 bugs (schema ✅, handler pending) | Bolt must implement Stripe webhook + tier enforcement |
| Flow 6: Weekly Digest | ✅ FIXED | 2 bugs → FIXED (BUG-003, BUG-004) | SDK URL fixed, unsubscribeToken added to schema |

**Overall: 4 bugs fixed. 4/6 flows partially implemented (awaiting Bolt API routes).**  
**Status: NOT YET DEPLOYMENT READY — core API routes unimplemented.**

---

## Flow 1: Project Setup Flow

**Path:** Signup → workspace auto-create → free subscription → project creation → API key generation

### Code Traced
- `apps/web/src/app/(auth)/signup/page.tsx` — UI form POSTs to `/api/auth/signup` ✅
- `packages/db/src/schema.ts` — schema verified:
  - `users` → `workspaces` FK (cascade delete) ✅
  - `workspaces` → `projects` FK (cascade delete) ✅
  - `workspaces.apiKey` = `tk_live_${crypto.randomBytes(32).toString("hex")}` ✅ (256-bit entropy)
  - `subscriptions.tier` defaults to `"free"` ✅
  - `subscriptions.workspaceId` → `workspaces.id` FK ✅

### Checks
| Check | Result | Detail |
|-------|--------|--------|
| FK integrity | ✅ PASS | All cascade deletes correct: users→workspaces→projects→translations |
| API key format `tk_live_` + 32 hex | ✅ PASS | `tk_live_${crypto.randomBytes(32).toString("hex")}` = 72 chars |
| Free tier default | ✅ PASS | `tier: varchar().default("free")` |
| Signup API route | ❌ MISSING | `/api/auth/signup` route not yet implemented (Bolt task [1.4]) |
| Workspace auto-create on signup | ❌ MISSING | No post-signup hook (Bolt task [1.4]) |
| Subscription auto-create | ❌ MISSING | No subscription provisioning code (Bolt task [1.4]) |

### Verdict
Schema design is solid. FK integrity confirmed. API key generation is cryptographically strong.  
**Blocked on Bolt implementing [1.4] Authentication Setup.**

---

## Flow 2: Translation AI Flow

**Path:** `POST /api/translations/translate` → OpenAI → batch 20 keys → DB upsert

### Code Traced
- `apps/web/src/lib/env.ts` — `OPENAI_API_KEY` validated server-side only ✅
- `grep -r NEXT_PUBLIC_OPENAI` → zero results ✅ (key never exposed to client)
- `packages/db/src/schema.ts` — `translation_values` table has `aiGenerated: boolean` flag ✅

### Checks
| Check | Result | Detail |
|-------|--------|--------|
| OpenAI key server-only | ✅ PASS | Validated in `env.ts`, no `NEXT_PUBLIC_` exposure anywhere |
| Batch size limits | ❌ MISSING | Route `/api/translations/translate` not yet implemented (Bolt [2.1]) |
| Error handling when AI fails | ❌ MISSING | No AI engine code exists yet |
| Async job tracking | ❌ MISSING | No job queue or async tracking implemented |
| `aiGenerated` flag in DB | ✅ PASS | Schema has `aiGenerated: boolean.default(false)` + `verifiedAt` timestamp |

### Verdict
Environment security is solid — OpenAI key is properly guarded.  
**Blocked on Bolt implementing [2.1] Translation API + AI Engine.**

---

## Flow 3: CDN Serving Flow

**Path:** `GET /api/cdn/[projectId]/[locale]` → cache headers → CORS wildcard

### Code Traced
- `apps/web/src/app/api/cdn/[projectId]/[locale]/route.ts` — full route exists ✅
- `apps/web/src/lib/rate-limit.ts` — `cdnRateLimiter(500, 60_000)` ✅

### Checks
| Check | Result | Detail |
|-------|--------|--------|
| CORS wildcard | ✅ PASS | `Access-Control-Allow-Origin: *` on all responses |
| OPTIONS preflight | ✅ PASS | `export async function OPTIONS()` handler present |
| Rate limiting 500/min | ✅ PASS | `checkRateLimit(cdnRateLimiter, projectId)` → 429 |
| Cache-Control 1h | ✅ **FIXED (BUG-001)** | Was `max-age=300`; fixed to `max-age=3600` |
| Bearer auth removed (public CDN) | ✅ **FIXED (BUG-002)** | Was rejecting requests without auth; CDN is public |
| Input sanitization | ✅ PASS | Regex guards on `projectId` and `locale` parameters |
| Fallback when locale missing | ⚠️ TODO | Stub comment for Bolt to implement 404 fallback |
| DB lookup implementation | ❌ MISSING | Returns `_todo` stub (Bolt [2.2]) |

### Bugs Fixed
- **BUG-001 [HIGH]**: `Cache-Control: public, max-age=300` → `max-age=3600` (1 hour per spec)
- **BUG-002 [HIGH]**: Removed Bearer auth gate — CDN is intentionally public (no auth needed to read translations)

### Verdict
Rate limiting, CORS, and input validation are correctly implemented.  
**2 bugs fixed. DB implementation blocked on Bolt [2.2].**

---

## Flow 4: Git Webhook Flow

**Path:** `POST /api/webhooks/[provider]` → HMAC-SHA256 → key extraction → auto-translate

### Code Traced
- `packages/db/src/schema.ts` → `webhooks` table:
  - `secret = crypto.randomBytes(32).toString("hex")` ✅ (256-bit per-webhook secret)
  - `events: jsonb.default(["push"])` ✅ (supports push events)
- No webhook route handler exists yet

### Checks
| Check | Result | Detail |
|-------|--------|--------|
| Webhook schema with secret | ✅ PASS | 32 random bytes (256 bits), per-webhook |
| `timingSafeEqual` usage | ❌ MISSING | No HMAC handler yet (Bolt [2.3]) |
| Raw body preserved for HMAC | ❌ MISSING | No webhook route; Bolt must use `request.text()` before parsing |
| Supported event types | ⚠️ PARTIAL | Schema stores events as JSONB; no filtering logic yet |
| HMAC-SHA256 signature check | ❌ MISSING | Route `/api/webhooks/[provider]` not implemented |
| GitHub `X-Hub-Signature-256` | ❌ MISSING | Not implemented |
| GitLab `X-Gitlab-Token` | ❌ MISSING | Not implemented |

### Verdict
Schema foundation is solid. Webhook secret generation is cryptographically strong.  
**Blocked on Bolt implementing [2.3] Git Webhooks.**  
**NOTE for Bolt:** Must use `crypto.timingSafeEqual()` for HMAC comparison and `request.arrayBuffer()` (not `.json()`) to preserve raw body for signature verification.

---

## Flow 5: Stripe Billing Flow

**Path:** Checkout → `POST /api/billing/webhook` → subscription update → tier enforcement

### Code Traced
- `packages/db/src/schema.ts` → `subscriptions` table:
  - `stripeCustomerId`, `stripePriceId`, `tier`, `status`, `currentPeriodEnd` ✅
  - `workspaceId` FK → `workspaces.id` (cascade) ✅
- `apps/web/src/lib/env.ts` — `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` both validated ✅

### Checks
| Check | Result | Detail |
|-------|--------|--------|
| Stripe secret server-only | ✅ PASS | Both in `env.ts` validation, no NEXT_PUBLIC_ |
| Subscription schema | ✅ PASS | All required fields: tier, status, currentPeriodEnd, stripeCustomerId |
| `constructEvent()` with raw body | ❌ MISSING | Webhook handler not implemented (Bolt [3.1]) |
| Tier enforcement on translate limits | ❌ MISSING | No plan limits applied in any route |
| Checkout session creation | ❌ MISSING | No Stripe checkout route |

### Verdict
Schema and env guards are correctly set up.  
**Blocked on Bolt implementing [3.1] Stripe Billing.**  
**NOTE for Bolt:** Stripe webhook handler MUST read raw body via `request.text()` — do NOT use `request.json()` as it invalidates the HMAC signature used by `stripe.webhooks.constructEvent()`.

### Plan Limits (to enforce when implementing)
| Tier | Translation Keys/mo | Projects |
|------|--------------------:|--------:|
| free | 500 | 2 |
| starter | 10,000 | 10 |
| pro | unlimited | unlimited |

---

## Flow 6: Weekly Digest Flow

**Path:** Cron Monday 9AM → fetch active projects → Resend email → unsubscribe validation

### Code Traced
- `apps/web/src/lib/env.ts` — `RESEND_API_KEY` validated ✅
- `packages/db/src/schema.ts` → `users` table:
  - **BUG-004 FOUND:** No `unsubscribeToken` or `digestOptOut` column — added by fix

### Checks
| Check | Result | Detail |
|-------|--------|--------|
| Resend API key server-only | ✅ PASS | Validated in `env.ts`, no client exposure |
| Unsubscribe token unique per user | ✅ **FIXED (BUG-004)** | Added `unsubscribeToken` + `digestOptOut` to `users` table |
| No data leak across workspaces | ❌ MISSING | Digest handler not implemented (Bolt [3.2]) |
| Cron Monday 9AM schedule | ❌ MISSING | No cron route `/api/cron/digest` |
| Resend email implementation | ❌ MISSING | Bolt [3.2] |

### Bug Fixed
- **BUG-004 [MEDIUM]**: `users` table had no unsubscribe token — weekly digest unsubscribe would be impossible without it. Added `unsubscribeToken` (unique, 256-bit, auto-generated) and `digestOptOut: boolean` to `users` schema.

### Verdict
Email env guard is set. Schema updated with unsubscribe support.  
**Blocked on Bolt implementing [3.2] Weekly Digest.**  
**NOTE for Bolt:** The unsubscribe endpoint must use constant-time comparison for token validation and set `digestOptOut = true` on match.

---

## All Bugs Fixed

### BUG-001 [HIGH] — Cache-Control: 5 min instead of 1 hour
- **File:** `apps/web/src/app/api/cdn/[projectId]/[locale]/route.ts`
- **Before:** `"Cache-Control": "public, max-age=300, s-maxage=300"`
- **After:** `"Cache-Control": "public, max-age=3600, s-maxage=3600"`
- **Impact:** Excessive origin cache misses; CDN vendors wouldn't cache efficiently
- **Status:** ✅ FIXED

### BUG-002 [HIGH] — CDN requires Bearer auth but is a public endpoint
- **File:** `apps/web/src/app/api/cdn/[projectId]/[locale]/route.ts`
- **Before:** Route returned 401 if `Authorization: Bearer` header was missing
- **After:** Removed auth check — CDN serves translation JSON publicly by projectId + locale
- **Impact:** SDK and any direct CDN consumers would get 401 errors making translations inaccessible
- **Status:** ✅ FIXED

### BUG-003 [MEDIUM] — SDK URL had spurious `.json` suffix
- **File:** `packages/sdk/src/index.ts` → `fetchTranslations()`
- **Before:** URL built as `${cdnBase}/api/cdn/${projectId}/${locale}.json`
- **After:** URL built as `${cdnBase}/api/cdn/${projectId}/${locale}`
- **Impact:** All SDK translation fetches would 404 — the `.json` suffix doesn't match the Next.js route
- **Status:** ✅ FIXED (combined with BUG-002 fix in same function)

### BUG-004 [MEDIUM] — Missing `unsubscribeToken` on users table
- **File:** `packages/db/src/schema.ts` → `users` table
- **Before:** No unsubscribe token column; no opt-out tracking
- **After:** Added `unsubscribeToken: text().unique().$defaultFn(() => crypto.randomBytes(32).toString("hex"))` and `digestOptOut: boolean.default(false)`
- **Impact:** Weekly digest unsubscribe flow would be impossible to implement correctly; no way to validate unsubscribe requests per user
- **Status:** ✅ FIXED

---

## Notes for Bolt

### Critical implementation requirements (from this audit):

1. **`/api/auth/signup`** — Create user → auto-create workspace → auto-create free subscription in one transaction. Use `bcryptjs` with cost factor ≥ 12.

2. **`/api/translations/translate`** — Batch max 20 keys per OpenAI call. Store job state for async tracking. Mark `aiGenerated = true` on all AI-produced values.

3. **CDN DB lookup** — Query `translation_values` JOIN `translation_keys` WHERE `projectId = :id AND locale = :locale`. Return 404 with graceful message when locale not found.

4. **Git webhook handler** — Use `request.arrayBuffer()` to read raw body, compute `HMAC-SHA256(secret, rawBody)`, compare with `crypto.timingSafeEqual()`. Support `push` events for GitHub (`X-Hub-Signature-256`) and GitLab (`X-Gitlab-Token`).

5. **Stripe webhook** — Use `request.text()` for raw body → `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`. Update `subscriptions.tier` on `customer.subscription.updated` and `invoice.payment_succeeded`.

6. **Weekly digest cron** — `GET /api/cron/digest` secured with `Authorization: Bearer ${CRON_SECRET}`. Fetch projects with activity in last 7 days. Send via Resend. Include unsubscribe link: `${CDN_BASE_URL}/unsubscribe?token=${user.unsubscribeToken}`.

7. **Rate limiter** — Replace in-memory `rate-limit.ts` with Upstash `@upstash/ratelimit` before production. In-memory doesn't work across replicas.

8. **Ownership verification** — Every authenticated API route MUST verify `workspace.userId === session.user.id` before processing. Never trust client-provided workspace/project IDs without cross-checking session ownership.

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/src/app/api/cdn/[projectId]/[locale]/route.ts` | BUG-001 + BUG-002: Cache 1h, auth removed |
| `packages/sdk/src/index.ts` | BUG-002 + BUG-003: No auth header, no .json suffix |
| `packages/db/src/schema.ts` | BUG-004: unsubscribeToken + digestOptOut on users |
| `INTEGRATION_TEST_REPORT.md` | This report |
