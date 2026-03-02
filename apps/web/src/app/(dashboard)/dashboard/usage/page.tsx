export const metadata = { title: "Usage" };

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CDN_HISTORY = [
  { day: "Mon", requests: 1240 },
  { day: "Tue", requests: 980 },
  { day: "Wed", requests: 1580 },
  { day: "Thu", requests: 2210 },
  { day: "Fri", requests: 1760 },
  { day: "Sat", requests: 890 },
  { day: "Sun", requests: 640 },
];

const maxRequests = Math.max(...CDN_HISTORY.map((d) => d.requests));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, limit, sub }: { label: string; value: string; limit?: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <p className="text-xs text-zinc-400">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold text-white">{value}</p>
        {limit && <p className="text-xs text-zinc-500">/ {limit}</p>}
      </div>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsagePage() {
  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Usage</h1>
        <p className="text-zinc-400 text-sm mt-1">Workspace-wide usage · March 2024 · Starter Plan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="API Calls (this month)" value="8,412" limit="10,000" sub="84% of plan limit" />
        <StatCard label="CDN Requests" value="9,310" sub="served from edge" />
        <StatCard label="Webhook Deliveries" value="142" sub="this month" />
        <StatCard label="AI Translations" value="1,247" limit="5,000" sub="24% of monthly quota" />
      </div>

      {/* Plan usage bar */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">API Calls</h2>
          <span className="text-xs text-zinc-500">8,412 / 10,000</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full" style={{ width: "84%", background: "#eab308" }} />
        </div>
        <p className="text-xs text-zinc-500 mt-2">Resets on Apr 1, 2024 · <span className="text-indigo-400 cursor-pointer hover:underline">Upgrade to Pro</span> for unlimited calls</p>
      </section>

      {/* CDN requests chart */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">CDN Requests — Last 7 Days</h2>
        <div className="flex items-end gap-3 h-36">
          {CDN_HISTORY.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-zinc-500">{d.requests.toLocaleString()}</span>
              <div
                className="w-full rounded-t-sm opacity-80"
                style={{
                  height: `${(d.requests / maxRequests) * 100}%`,
                  background: "#4f46e5",
                  minHeight: "4px",
                }}
              />
              <span className="text-[10px] text-zinc-500">{d.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Webhook deliveries */}
      <section className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Recent Webhook Deliveries</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Event", "URL", "Status", "Delivered"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-zinc-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { event: "translation.push", url: "my-app.com/…", status: 200, time: "2 min ago" },
              { event: "translation.push", url: "my-app.com/…", status: 200, time: "1 hour ago" },
              { event: "coverage.updated", url: "my-app.com/…", status: 500, time: "3 hours ago" },
              { event: "translation.push", url: "my-app.com/…", status: 200, time: "1 day ago" },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-mono text-xs text-indigo-300">{row.event}</td>
                <td className="px-5 py-3 text-xs text-zinc-400">{row.url}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    row.status === 200 ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-zinc-400">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
