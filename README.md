# TranslateKit

> AI-powered i18n translation management for indie SaaS. Upload locale JSON, get 20+ languages instantly. 1/7th the price of Phrase.

## What is TranslateKit?

TranslateKit lets you manage your app's translations without the enterprise pricing of Phrase ($100+/mo) or Lokalise ($120+/mo). Upload your `en.json`, get all 20+ languages translated via GPT-4o-mini, serve them via CDN API, and keep them in sync via Git webhooks.

## Pricing

| Plan | Price | Projects | Languages | Keys/mo |
|------|-------|----------|-----------|---------|
| Free | $0 | 2 | 5 | 1K |
| Starter | $9/mo | 10 | 20 | 100K |
| Pro | $29/mo | ∞ | ∞ | ∞ |

## Monorepo Structure

```
translatekit/
├── apps/
│   └── web/              # Next.js 14 App Router
├── packages/
│   ├── db/               # @translatekit/db (Drizzle ORM)
│   └── sdk/              # @translatekit/sdk (vanilla JS CDN client)
└── turbo.json
```

## Tech Stack

- **Framework:** Next.js 14 App Router, TypeScript strict
- **Database:** PostgreSQL + Drizzle ORM
- **AI:** OpenAI GPT-4o-mini (batch translation)
- **Auth:** NextAuth.js v5 (Credentials, JWT)
- **Billing:** Stripe
- **Email:** Resend
- **Queue:** BullMQ + Redis
- **Brand:** Indigo/Violet (#6366f1)

## Getting Started

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
CDN_BASE_URL=https://translatekit.threestack.io
```

## Deployment

Deployed on Vercel at [translatekit.threestack.io](https://translatekit.threestack.io).

---

Built by [ThreeStack](https://threestack.io) 🚀
