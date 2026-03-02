import Link from "next/link";
import { Globe, Plus, Languages } from "lucide-react";

export const metadata = { title: "Projects" };

const MOCK_PROJECTS = [
  {
    id: "proj_1",
    name: "My SaaS App",
    defaultLocale: "en",
    keysCount: 142,
    languages: ["fr", "de", "es", "ja", "pt"],
    coverage: 87,
    updatedAt: "2 hours ago",
  },
  {
    id: "proj_2",
    name: "Landing Page",
    defaultLocale: "en",
    keysCount: 38,
    languages: ["fr", "de"],
    coverage: 100,
    updatedAt: "1 day ago",
  },
  {
    id: "proj_3",
    name: "Mobile App",
    defaultLocale: "en",
    keysCount: 96,
    languages: ["es", "pt", "ja", "zh", "ko"],
    coverage: 42,
    updatedAt: "3 days ago",
  },
];

const FLAG: Record<string, string> = {
  en: "🇺🇸", fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸", ja: "🇯🇵",
  pt: "🇵🇹", zh: "🇨🇳", ko: "🇰🇷", it: "🇮🇹", nl: "🇳🇱",
};

export default function ProjectsPage() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your i18n translation projects</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: "#4f46e5" }}
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Projects", value: "3" },
          { label: "Total Keys", value: "276" },
          { label: "Languages Active", value: "8" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-zinc-400">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Project cards */}
      <div className="space-y-3">
        {MOCK_PROJECTS.map((project) => (
          <div
            key={project.id}
            className="rounded-xl bg-white/5 border border-white/10 p-5 hover:border-indigo-500/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/20">
                  <Globe className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{project.name}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Default: {FLAG[project.defaultLocale] ?? "🌐"} {project.defaultLocale.toUpperCase()} · Updated {project.updatedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/projects/${project.id}/keys`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Keys
                </Link>
                <Link
                  href={`/dashboard/projects/${project.id}/analytics`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  href={`/dashboard/projects/${project.id}/settings`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Settings
                </Link>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-sm">
                <Languages className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-zinc-400">{project.keysCount} keys</span>
              </div>
              <div className="flex items-center gap-1">
                {project.languages.map((lang) => (
                  <span key={lang} className="text-base" title={lang.toUpperCase()}>
                    {FLAG[lang] ?? "🌐"}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-zinc-500">{project.coverage}% translated</span>
                <div className="w-24 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${project.coverage}%`,
                      background: project.coverage >= 80 ? "#22c55e" : project.coverage >= 50 ? "#eab308" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
