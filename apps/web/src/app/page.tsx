import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TranslateKit — AI i18n for Indie SaaS",
  description:
    "Upload your locale JSON, AI translates into 20+ languages in seconds. 1/7th the price of Phrase. Sync via CDN API or Git webhook.",
  keywords: ["i18n", "translation", "localization", "AI", "SaaS", "indie", "JSON"],
  openGraph: {
    title: "TranslateKit — AI i18n for Indie SaaS",
    description: "Upload locale JSON, get 20+ languages instantly via AI.",
    url: "https://translatekit.threestack.io",
    siteName: "TranslateKit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TranslateKit — AI i18n for Indie SaaS",
    description: "Upload locale JSON, get 20+ languages instantly via AI.",
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "✨",
    title: "AI-Powered Translation",
    desc: "GPT-4 translates your keys with context awareness. Way better than DeepL for technical strings.",
  },
  {
    icon: "🔗",
    title: "Git Webhook Sync",
    desc: "Push to GitHub → translations auto-update. Zero manual workflow needed.",
  },
  {
    icon: "⚡",
    title: "CDN API",
    desc: "Serve locale JSON from the edge. Fast, reliable, and always in sync with your source.",
  },
  {
    icon: "📊",
    title: "Coverage Dashboard",
    desc: "See exactly which languages are incomplete. Drill down to missing keys per language.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Upload your locale JSON",
    desc: "Drag & drop your en.json (or any source locale). We parse the keys automatically.",
  },
  {
    num: "02",
    title: "AI translates in seconds",
    desc: "GPT-4 translates all keys into your chosen languages with context & tone preserved.",
  },
  {
    num: "03",
    title: "Sync via CDN or Webhook",
    desc: "Fetch translated JSON from our edge CDN or receive a webhook push on completion.",
  },
];

const COMPARE = [
  { feature: "Price / month", translatekit: "$9", phrase: "$200+", lokalise: "$120+" },
  { feature: "AI Translation", translatekit: "✅ GPT-4", phrase: "❌ No", lokalise: "⚠️ Add-on" },
  { feature: "CDN API", translatekit: "✅ Included", phrase: "✅ Included", lokalise: "✅ Included" },
  { feature: "Git Webhooks", translatekit: "✅ Included", phrase: "✅ Included", lokalise: "✅ Included" },
  { feature: "Languages", translatekit: "20+", phrase: "500+", lokalise: "500+" },
  { feature: "Indie friendly", translatekit: "✅ Yes", phrase: "❌ Enterprise", lokalise: "❌ Enterprise" },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    desc: "Perfect for side projects",
    features: ["3 projects", "500 keys", "5 languages", "CDN API", "Community support"],
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    desc: "For growing indie SaaS",
    features: ["10 projects", "10,000 keys", "20 languages", "CDN API", "Git webhooks", "Email support"],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    desc: "For teams & agencies",
    features: [
      "Unlimited projects",
      "Unlimited keys",
      "All 20+ languages",
      "CDN API",
      "Git webhooks",
      "Priority support",
      "Team members",
    ],
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
];

const CODE_SNIPPET = `{
  "auth.login.title": "Sign In",
  "auth.login.email": "Enter your email",
  "auth.login.submit": "Sign in to your account",
  "nav.projects": "Projects",
  "nav.settings": "Settings"
}`;

const OUTPUT_SNIPPET = `// 🇫🇷 fr.json — AI translated in 1.2s
{
  "auth.login.title": "Se connecter",
  "auth.login.email": "Entrez votre email",
  "auth.login.submit": "Connectez-vous à votre compte",
  "nav.projects": "Projets",
  "nav.settings": "Paramètres"
}`;

// ─── Components ───────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🌐</span>
          <span className="text-base font-bold text-white">TranslateKit</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="https://docs.translatekit.threestack.io" className="hover:text-white transition-colors">Docs</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: "#4f46e5" }}
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      <NavBar />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-20 px-6 text-center overflow-hidden">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(79,70,229,0.25) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 mb-6">
            ✨ AI-powered i18n · 20+ languages · From $0/mo
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-5">
            Translate Your App Into
            <br />
            <span style={{ color: "#818cf8" }}>20+ Languages</span> Instantly
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
            Upload your locale JSON, AI translates in seconds.{" "}
            <span className="text-white font-medium">1/7th the price of Phrase.</span> Sync via CDN API or Git webhook.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-xl text-base font-semibold text-white transition-colors"
              style={{ background: "#4f46e5" }}
            >
              Get Started Free →
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 rounded-xl text-base font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              View Pricing
            </Link>
          </div>

          {/* Code snippet */}
          <div className="grid md:grid-cols-2 gap-3 text-left max-w-3xl mx-auto">
            <div className="rounded-xl bg-[#1a1a1a] border border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-zinc-500">en.json</span>
              </div>
              <pre className="p-4 text-xs text-zinc-300 font-mono leading-relaxed overflow-x-auto">
                {CODE_SNIPPET}
              </pre>
            </div>
            <div className="rounded-xl bg-[#1a1a1a] border border-indigo-500/30 overflow-hidden">
              <div className="px-4 py-2 border-b border-indigo-500/20 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-indigo-400">✨ fr.json</span>
              </div>
              <pre className="p-4 text-xs text-indigo-200 font-mono leading-relaxed overflow-x-auto">
                {OUTPUT_SNIPPET}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/10 py-8 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "20+", label: "Languages" },
            { value: "1.2s", label: "Avg. translation time" },
            { value: "$9/mo", label: "Starter plan" },
            { value: "vs $200+", label: "Phrase pricing" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-zinc-400">Three steps from source JSON to 20+ translated locales</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.num} className="flex flex-col items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "#4f46e5" }}
              >
                {step.num}
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
            <p className="text-zinc-400">Built for indie SaaS — not enterprise bloat</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-white/5 border border-white/10 p-6 hover:border-indigo-500/40 transition-colors"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-base font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Why TranslateKit?</h2>
          <p className="text-zinc-400">1/7th the price. Same power. Better DX.</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400">Feature</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white" style={{ background: "#4f46e5" + "22" }}>
                  TranslateKit
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-zinc-400">Phrase</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-zinc-400">Lokalise</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr key={row.feature} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                  <td className="px-6 py-3.5 text-sm text-zinc-300">{row.feature}</td>
                  <td className="px-6 py-3.5 text-center text-sm font-medium text-white" style={{ background: "#4f46e5" + "11" }}>
                    {row.translatekit}
                  </td>
                  <td className="px-6 py-3.5 text-center text-sm text-zinc-400">{row.phrase}</td>
                  <td className="px-6 py-3.5 text-center text-sm text-zinc-400">{row.lokalise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-6 bg-white/[0.02] border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Simple, Honest Pricing</h2>
            <p className="text-zinc-400">No seats. No overage surprises. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 flex flex-col ${
                  plan.highlight
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full bg-indigo-500 text-xs text-white font-medium mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5 mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-zinc-400">{plan.period}</span>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="text-green-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "text-white"
                      : "text-zinc-300 hover:text-white border border-white/10 hover:border-white/20"
                  }`}
                  style={plan.highlight ? { background: "#4f46e5" } : undefined}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start translating in 60 seconds
          </h2>
          <p className="text-zinc-400 mb-8">
            Free plan. No credit card required. 3 projects forever free.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 rounded-xl text-base font-semibold text-white transition-colors"
            style={{ background: "#4f46e5" }}
          >
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <span className="text-sm font-bold text-white">TranslateKit</span>
            <span className="text-xs text-zinc-500 ml-2">© 2024 ThreeStack</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="https://docs.translatekit.threestack.io" className="hover:text-white transition-colors">Docs</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
