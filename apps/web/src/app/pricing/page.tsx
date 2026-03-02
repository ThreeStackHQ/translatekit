import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — TranslateKit",
  description:
    "Simple, honest pricing for AI-powered i18n. Free forever, Starter at $9/mo, Pro at $29/mo.",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const TIERS = [
  {
    name: "Free",
    price: 0,
    period: "/mo",
    desc: "Perfect for side projects & experiments",
    features: {
      projects: "3",
      keys: "500",
      languages: "5 languages",
      ai: "500 AI translations/mo",
      cdn: "CDN API",
      webhooks: "—",
      support: "Community",
    },
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Starter",
    price: 9,
    period: "/mo",
    desc: "For growing indie SaaS products",
    features: {
      projects: "10",
      keys: "10,000",
      languages: "All 20+ languages",
      ai: "5,000 AI translations/mo",
      cdn: "CDN API",
      webhooks: "Git webhooks",
      support: "Email support",
    },
    cta: "Start Free Trial",
    href: "/signup?plan=starter",
    highlight: true,
  },
  {
    name: "Pro",
    price: 29,
    period: "/mo",
    desc: "For teams, agencies & high-volume apps",
    features: {
      projects: "Unlimited",
      keys: "Unlimited",
      languages: "All 20+ languages",
      ai: "Unlimited AI translations",
      cdn: "CDN API + caching",
      webhooks: "Git webhooks + retry",
      support: "Priority support",
    },
    cta: "Get Started",
    href: "/signup?plan=pro",
    highlight: false,
  },
];

const FEATURE_ROWS: { label: string; key: keyof typeof TIERS[0]["features"] }[] = [
  { label: "Projects", key: "projects" },
  { label: "Translation Keys", key: "keys" },
  { label: "Target Languages", key: "languages" },
  { label: "AI Translations", key: "ai" },
  { label: "CDN API", key: "cdn" },
  { label: "Webhooks", key: "webhooks" },
  { label: "Support", key: "support" },
];

const FAQS = [
  {
    q: "How good is the AI translation quality?",
    a: "We use GPT-4 with context-aware prompts. For most SaaS UI strings (buttons, labels, error messages), quality is excellent. We also pass your key names and context field to the AI, which helps significantly. You can verify and override any translation in the dashboard.",
  },
  {
    q: "What happens when I hit the key limit?",
    a: "You won't lose any data. Existing keys and translations remain intact. You just can't add new keys until you upgrade your plan. We'll email you at 80% and 100% usage.",
  },
  {
    q: "How do Git webhooks work?",
    a: "Connect your GitHub/GitLab repo. When you push a commit that changes your source locale file (e.g., en.json), TranslateKit automatically detects new/changed keys and triggers AI translation for all enabled languages. A webhook fires when translations are ready.",
  },
  {
    q: "What's the CDN API latency?",
    a: "Locale JSON files are cached at the edge via Cloudflare. First-load response time is typically <50ms globally. Cache invalidation happens automatically when translations are updated.",
  },
  {
    q: "Can I get help with setup?",
    a: "Free plan users get community support via GitHub Discussions. Starter plan users get email support with a 24h SLA. Pro plan users get priority support with a 4h SLA and optional onboarding call.",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function FeatureVal({ val }: { val: string }) {
  if (val === "—") return <span className="text-zinc-600">—</span>;
  return <span className="text-sm text-zinc-300">{val}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🌐</span>
            <span className="text-base font-bold text-white">TranslateKit</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: "#4f46e5" }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-12 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Simple, Honest Pricing
          </h1>
          <p className="text-lg text-zinc-400">
            No seats, no overage surprises, no enterprise sales calls.<br />
            Start free. Upgrade when you need to.
          </p>
        </div>
      </section>

      {/* Tier cards */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                tier.highlight
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {tier.highlight && (
                <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full bg-indigo-500 text-xs text-white font-medium mb-3">
                  Most Popular
                </span>
              )}
              <h2 className="text-xl font-bold text-white">{tier.name}</h2>
              <p className="text-xs text-zinc-400 mt-0.5 mb-4">{tier.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">${tier.price}</span>
                <span className="text-sm text-zinc-400">{tier.period}</span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-7">
                {Object.values(tier.features).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`block text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tier.highlight
                    ? "text-white"
                    : "text-zinc-300 hover:text-white border border-white/10 hover:border-white/20"
                }`}
                style={tier.highlight ? { background: "#4f46e5" } : undefined}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Compare Plans</h2>
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400">Feature</th>
                {TIERS.map((t) => (
                  <th
                    key={t.name}
                    className="px-6 py-4 text-center text-xs font-medium"
                    style={t.highlight ? { color: "white", background: "#4f46e522" } : { color: "#9ca3af" }}
                  >
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, i) => (
                <tr key={row.key} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                  <td className="px-6 py-3.5 text-sm text-zinc-400">{row.label}</td>
                  {TIERS.map((t) => (
                    <td
                      key={t.name}
                      className="px-6 py-3.5 text-center"
                      style={t.highlight ? { background: "#4f46e511" } : undefined}
                    >
                      <FeatureVal val={t.features[row.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 text-center">
        <div className="max-w-xl mx-auto rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-10">
          <h2 className="text-2xl font-bold text-white mb-3">
            Start for free, upgrade anytime
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            3 projects, 500 keys, forever free. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: "#4f46e5" }}
            >
              Get Started Free →
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <span className="text-sm font-bold text-white">TranslateKit</span>
            <span className="text-xs text-zinc-500 ml-2">© 2024 ThreeStack</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
