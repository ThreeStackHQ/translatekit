"use client";

import { useState, useMemo } from "react";
import { Upload, Plus, Download, Search, X, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TranslationValue {
  value: string;
  aiGenerated: boolean;
  verified: boolean;
}

interface TranslationKey {
  id: string;
  key: string;
  defaultValue: string;
  context?: string;
  translations: Record<string, TranslationValue | null>;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "fr", flag: "🇫🇷", name: "French" },
  { code: "de", flag: "🇩🇪", name: "German" },
  { code: "es", flag: "🇪🇸", name: "Spanish" },
  { code: "pt", flag: "🇵🇹", name: "Portuguese" },
  { code: "ja", flag: "🇯🇵", name: "Japanese" },
  { code: "zh", flag: "🇨🇳", name: "Chinese" },
  { code: "ko", flag: "🇰🇷", name: "Korean" },
  { code: "it", flag: "🇮🇹", name: "Italian" },
];

const MOCK_KEYS: TranslationKey[] = [
  {
    id: "k1", key: "auth.login.title", defaultValue: "Sign In",
    context: "Login page heading",
    translations: {
      fr: { value: "Se connecter", aiGenerated: true, verified: true },
      de: { value: "Anmelden", aiGenerated: true, verified: false },
      es: { value: "Iniciar sesión", aiGenerated: false, verified: true },
      pt: { value: "Entrar", aiGenerated: true, verified: false },
      ja: null, zh: null, ko: null, it: null,
    },
  },
  {
    id: "k2", key: "auth.login.email_placeholder", defaultValue: "Enter your email",
    translations: {
      fr: { value: "Entrez votre email", aiGenerated: true, verified: true },
      de: { value: "E-Mail eingeben", aiGenerated: true, verified: true },
      es: null, pt: null, ja: null, zh: null, ko: null, it: null,
    },
  },
  {
    id: "k3", key: "auth.login.password_placeholder", defaultValue: "Enter your password",
    translations: {
      fr: { value: "Entrez votre mot de passe", aiGenerated: true, verified: false },
      de: null, es: null, pt: null, ja: null, zh: null, ko: null, it: null,
    },
  },
  {
    id: "k4", key: "auth.signup.title", defaultValue: "Create Account",
    translations: {
      fr: { value: "Créer un compte", aiGenerated: false, verified: true },
      de: { value: "Konto erstellen", aiGenerated: true, verified: true },
      es: { value: "Crear cuenta", aiGenerated: true, verified: true },
      pt: { value: "Criar conta", aiGenerated: true, verified: true },
      ja: { value: "アカウント作成", aiGenerated: true, verified: false },
      zh: { value: "创建账户", aiGenerated: true, verified: false },
      ko: null, it: null,
    },
  },
  {
    id: "k5", key: "nav.projects", defaultValue: "Projects",
    translations: {
      fr: { value: "Projets", aiGenerated: true, verified: true },
      de: { value: "Projekte", aiGenerated: true, verified: true },
      es: { value: "Proyectos", aiGenerated: true, verified: true },
      pt: { value: "Projetos", aiGenerated: true, verified: true },
      ja: { value: "プロジェクト", aiGenerated: true, verified: true },
      zh: { value: "项目", aiGenerated: true, verified: true },
      ko: { value: "프로젝트", aiGenerated: true, verified: false },
      it: { value: "Progetti", aiGenerated: true, verified: true },
    },
  },
  {
    id: "k6", key: "nav.settings", defaultValue: "Settings",
    translations: {
      fr: { value: "Paramètres", aiGenerated: true, verified: true },
      de: { value: "Einstellungen", aiGenerated: true, verified: true },
      es: { value: "Configuración", aiGenerated: false, verified: true },
      pt: { value: "Configurações", aiGenerated: true, verified: false },
      ja: null, zh: null, ko: null, it: null,
    },
  },
  {
    id: "k7", key: "dashboard.welcome", defaultValue: "Welcome back, {name}!",
    translations: {
      fr: null, de: null, es: null, pt: null, ja: null, zh: null, ko: null, it: null,
    },
  },
  {
    id: "k8", key: "dashboard.no_projects", defaultValue: "No projects yet. Create your first one!",
    translations: {
      fr: { value: "Aucun projet. Créez le vôtre!", aiGenerated: true, verified: false },
      de: null, es: null, pt: null, ja: null, zh: null, ko: null, it: null,
    },
  },
];

const PAGE_SIZE = 50;

// ─── Cell Component ───────────────────────────────────────────────────────────

function TranslationCell({
  value,
  onSave,
}: {
  value: TranslationValue | null;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value?.value ?? "");

  if (editing) {
    return (
      <td className="px-2 py-1 min-w-[160px] border-r border-white/5">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { onSave(draft); setEditing(false); }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
            if (e.key === "Enter" && e.metaKey) { onSave(draft); setEditing(false); }
          }}
          className="w-full min-h-[56px] px-2 py-1 text-xs text-white rounded bg-indigo-900/40 border border-indigo-500 outline-none resize-none"
        />
      </td>
    );
  }

  if (!value) {
    return (
      <td
        className="px-3 py-2 min-w-[160px] border-r border-white/5 cursor-pointer hover:bg-white/5"
        onClick={() => setEditing(true)}
      >
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          Missing
        </span>
      </td>
    );
  }

  return (
    <td
      className="px-3 py-2 min-w-[160px] border-r border-white/5 cursor-pointer hover:bg-white/5 group"
      onClick={() => setEditing(true)}
    >
      <div className="flex items-start gap-1">
        {value.aiGenerated && <span className="shrink-0 mt-0.5 text-xs">✨</span>}
        <span className="text-xs text-zinc-300 leading-relaxed flex-1 break-words line-clamp-2">
          {value.value}
        </span>
        {value.verified && (
          <span className="shrink-0 mt-0.5">
            <Check className="h-3 w-3 text-green-400" />
          </span>
        )}
      </div>
    </td>
  );
}

// ─── Upload JSON Dialog ───────────────────────────────────────────────────────

function UploadDialog({ onClose }: { onClose: () => void }) {
  const [locale, setLocale] = useState("fr");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Upload Locale JSON</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Target Locale</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">JSON File</label>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">Click to upload or drag & drop</p>
              <p className="text-xs text-zinc-600 mt-1">.json files only</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: "#4f46e5" }}
          >
            Upload & Parse
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Key Dialog ───────────────────────────────────────────────────────────

function AddKeyDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ key: "", defaultValue: "", context: "" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Add Translation Key</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { field: "key" as const, label: "Key Name", placeholder: "auth.login.title" },
            { field: "defaultValue" as const, label: "Default Value (EN)", placeholder: "Sign In" },
            { field: "context" as const, label: "Context (optional)", placeholder: "Appears on the login page heading" },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: "#4f46e5" }}
          >
            Add Key
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KeysEditorPage({ params }: { params: { id: string } }) {
  const [keys, setKeys] = useState<TranslationKey[]>(MOCK_KEYS);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showAddKey, setShowAddKey] = useState(false);

  const projectName = "My SaaS App";

  const filtered = useMemo(() => {
    return keys.filter((k) => {
      if (search && !k.key.toLowerCase().includes(search.toLowerCase())) return false;
      if (langFilter !== "all") {
        const t = k.translations[langFilter];
        if (statusFilter === "missing" && t) return false;
        if (statusFilter === "missing" && !t) return true;
      }
      if (statusFilter === "missing") {
        return Object.values(k.translations).some((v) => !v);
      }
      if (statusFilter === "verified") {
        return Object.values(k.translations).some((v) => v?.verified);
      }
      if (statusFilter === "unverified") {
        return Object.values(k.translations).some((v) => v && !v.verified);
      }
      return true;
    });
  }, [keys, search, langFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSave(keyId: string, lang: string, val: string) {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === keyId
          ? {
              ...k,
              translations: {
                ...k.translations,
                [lang]: val
                  ? { value: val, aiGenerated: false, verified: false }
                  : null,
              },
            }
          : k
      )
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
      {showAddKey && <AddKeyDialog onClose={() => setShowAddKey(false)} />}

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-white">
            {projectName} — Translation Keys
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {filtered.length} keys · {LANGUAGES.length} languages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload JSON
          </button>
          <button
            onClick={() => setShowAddKey(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            style={{ background: "#4f46e5" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Key
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-3 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter by key name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
        >
          <option value="all">All Languages</option>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.code.toUpperCase()}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="missing">Missing</option>
        </select>
        <div className="flex items-center gap-2 ml-auto text-xs text-zinc-500">
          <span>✨ AI-generated</span>
          <Check className="h-3 w-3 text-green-400" />
          <span>Verified</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-[#111111]">
            <tr className="border-b border-white/10">
              <th className="sticky left-0 z-20 bg-[#111111] px-4 py-2.5 text-left text-xs font-medium text-zinc-400 border-r border-white/10 min-w-[220px]">
                Key
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-400 border-r border-white/10 min-w-[180px]">
                🇺🇸 Default (EN)
              </th>
              {LANGUAGES.map((l) => (
                <th
                  key={l.code}
                  className="px-4 py-2.5 text-left text-xs font-medium text-zinc-400 border-r border-white/10 min-w-[160px]"
                >
                  {l.flag} {l.code.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((k, i) => (
              <tr
                key={k.id}
                className={`border-b border-white/5 hover:bg-white/[0.02] ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}
              >
                {/* Key column — sticky */}
                <td className="sticky left-0 z-10 bg-[#111111] px-4 py-2.5 border-r border-white/10">
                  <div>
                    <span className="text-xs font-mono text-indigo-300">{k.key}</span>
                    {k.context && (
                      <p className="text-[10px] text-zinc-600 mt-0.5 truncate max-w-[180px]">
                        {k.context}
                      </p>
                    )}
                  </div>
                </td>
                {/* Default value */}
                <td className="px-4 py-2.5 border-r border-white/10">
                  <span className="text-xs text-zinc-300">{k.defaultValue}</span>
                </td>
                {/* Language columns */}
                {LANGUAGES.map((l) => (
                  <TranslationCell
                    key={l.code}
                    value={k.translations[l.code] ?? null}
                    onSave={(v) => handleSave(k.id, l.code, v)}
                  />
                ))}
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={2 + LANGUAGES.length} className="px-4 py-12 text-center text-zinc-500 text-sm">
                  No keys match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between shrink-0">
        <span className="text-xs text-zinc-500">
          {filtered.length === 0
            ? "No keys"
            : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length} keys`}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-zinc-500">
            Page {page + 1} of {Math.max(1, totalPages)}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
