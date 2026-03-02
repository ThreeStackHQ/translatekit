export const metadata = { title: "Analytics" };

// ─── Types & Mock Data ────────────────────────────────────────────────────────

interface LangRow {
  code: string;
  flag: string;
  name: string;
  total: number;
  translated: number;
  missing: number;
  aiGenerated: number;
  verifiedAt: string | null;
}

const TOTAL_KEYS = 142;

const LANG_ROWS: LangRow[] = [
  { code: "fr", flag: "🇫🇷", name: "French", total: 142, translated: 132, missing: 10, aiGenerated: 98, verifiedAt: "2024-01-15" },
  { code: "de", flag: "🇩🇪", name: "German", total: 142, translated: 118, missing: 24, aiGenerated: 110, verifiedAt: null },
  { code: "es", flag: "🇪🇸", name: "Spanish", total: 142, translated: 142, missing: 0, aiGenerated: 87, verifiedAt: "2024-01-10" },
  { code: "pt", flag: "🇵🇹", name: "Portuguese", total: 142, translated: 62, missing: 80, aiGenerated: 62, verifiedAt: null },
  { code: "ja", flag: "🇯🇵", name: "Japanese", total: 142, translated: 28, missing: 114, aiGenerated: 28, verifiedAt: null },
  { code: "zh", flag: "🇨🇳", name: "Chinese", total: 142, translated: 0, missing: 142, aiGenerated: 0, verifiedAt: null },
  { code: "ko", flag: "🇰🇷", name: "Korean", total: 142, translated: 0, missing: 142, aiGenerated: 0, verifiedAt: null },
  { code: "it", flag: "🇮🇹", name: "Italian", total: 142, translated: 89, missing: 53, aiGenerated: 89, verifiedAt: null },
];

const TOP_MISSING = [
  { key: "dashboard.welcome", missing: 7 },
  { key: "dashboard.no_projects", missing: 6 },
  { key: "auth.login.password_placeholder", missing: 6 },
  { key: "errors.network_timeout", missing: 5 },
  { key: "onboarding.step_1_title", missing: 5 },
  { key: "billing.upgrade_cta", missing: 4 },
];

const COVERAGE_HISTORY = [
  { month: "Aug", coverage: 22 },
  { month: "Sep", coverage: 38 },
  { month: "Oct", coverage: 51 },
  { month: "Nov", coverage: 67 },
  { month: "Dec", coverage: 78 },
  { month: "Jan", coverage: 89 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function coverageColor(pct: number) {
  if (pct >= 80) return "#22c55e";
  if (pct >= 50) return "#eab308";
  return "#ef4444";
}

function coverageStatus(pct: number) {
  if (pct === 100) return { label: "Complete", color: "text-green-400 bg-green-400/10" };
  if (pct > 0) return { label: "In Progress", color: "text-yellow-400 bg-yellow-400/10" };
  return { label: "Not Started", color: "text-red-400 bg-red-400/10" };
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const totalTranslated = LANG_ROWS.reduce((s, r) => s + r.translated, 0);
  const totalMissing = LANG_ROWS.reduce((s, r) => s + r.missing, 0);
  const totalAi = LANG_ROWS.reduce((s, r) => s + r.aiGenerated, 0);
  const totalSlots = TOTAL_KEYS * LANG_ROWS.length;
  const aiPct = totalSlots > 0 ? Math.round((totalAi / totalSlots) * 100) : 0;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Translation Analytics</h1>
        <p className="text-zinc-400 text-sm mt-1">My SaaS App · {TOTAL_KEYS} source keys · {LANG_ROWS.length} target languages</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Keys" value={TOTAL_KEYS.toString()} sub="source strings" />
        <StatCard
          label="Translated"
          value={totalTranslated.toLocaleString()}
          sub={`of ${totalSlots.toLocaleString()} slots`}
        />
        <StatCard
          label="Missing"
          value={totalMissing.toLocaleString()}
          sub="need translation"
        />
        <StatCard
          label="AI-Generated"
          value={`${aiPct}%`}
          sub={`${totalAi.toLocaleString()} values`}
        />
      </div>

      {/* Coverage Table */}
      <section className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Coverage by Language</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Language", "Total Keys", "Translated", "Missing", "Coverage", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LANG_ROWS.map((r) => {
                const pct = Math.round((r.translated / r.total) * 100);
                const status = coverageStatus(pct);
                return (
                  <tr key={r.code} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.flag}</span>
                        <div>
                          <p className="text-sm text-white font-medium">{r.name}</p>
                          <p className="text-xs text-zinc-500">{r.code.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-300">{r.total}</td>
                    <td className="px-5 py-3 text-sm text-green-400">{r.translated}</td>
                    <td className="px-5 py-3 text-sm text-red-400">{r.missing}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-white/10">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${pct}%`, background: coverageColor(pct) }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400 w-8">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Coverage over time */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Coverage Over Time (avg. all languages)</h2>
        <div className="flex items-end gap-2 h-32">
          {COVERAGE_HISTORY.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-zinc-400">{m.coverage}%</span>
              <div className="w-full rounded-t" style={{ height: `${m.coverage}%`, background: "#4f46e5", opacity: 0.8 }} />
              <span className="text-[10px] text-zinc-500">{m.month}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top missing keys */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Top Keys Missing Translations</h2>
        <div className="space-y-2">
          {TOP_MISSING.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-xs font-mono text-indigo-300">{item.key}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                Missing in {item.missing} langs
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
