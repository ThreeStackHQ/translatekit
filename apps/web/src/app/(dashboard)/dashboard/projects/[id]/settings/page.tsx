"use client";

import { useState } from "react";
import { X, Plus, AlertTriangle, Eye, EyeOff, Check } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_LANGUAGES = [
  { code: "fr", flag: "🇫🇷", name: "French", nativeName: "Français" },
  { code: "de", flag: "🇩🇪", name: "German", nativeName: "Deutsch" },
  { code: "es", flag: "🇪🇸", name: "Spanish", nativeName: "Español" },
  { code: "pt", flag: "🇵🇹", name: "Portuguese", nativeName: "Português" },
  { code: "ja", flag: "🇯🇵", name: "Japanese", nativeName: "日本語" },
  { code: "zh", flag: "🇨🇳", name: "Chinese", nativeName: "中文" },
  { code: "ko", flag: "🇰🇷", name: "Korean", nativeName: "한국어" },
  { code: "it", flag: "🇮🇹", name: "Italian", nativeName: "Italiano" },
  { code: "nl", flag: "🇳🇱", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl", flag: "🇵🇱", name: "Polish", nativeName: "Polski" },
  { code: "ru", flag: "🇷🇺", name: "Russian", nativeName: "Русский" },
  { code: "ar", flag: "🇸🇦", name: "Arabic", nativeName: "العربية" },
  { code: "hi", flag: "🇮🇳", name: "Hindi", nativeName: "हिन्दी" },
  { code: "tr", flag: "🇹🇷", name: "Turkish", nativeName: "Türkçe" },
  { code: "sv", flag: "🇸🇪", name: "Swedish", nativeName: "Svenska" },
  { code: "da", flag: "🇩🇰", name: "Danish", nativeName: "Dansk" },
  { code: "fi", flag: "🇫🇮", name: "Finnish", nativeName: "Suomi" },
  { code: "nb", flag: "🇳🇴", name: "Norwegian", nativeName: "Norsk" },
  { code: "cs", flag: "🇨🇿", name: "Czech", nativeName: "Čeština" },
  { code: "uk", flag: "🇺🇦", name: "Ukrainian", nativeName: "Українська" },
];

interface EnabledLanguage {
  code: string;
  enabled: boolean;
  coverage: number;
}

// ─── Language Picker Modal ────────────────────────────────────────────────────

function LanguagePickerModal({
  enabledCodes,
  onAdd,
  onClose,
}: {
  enabledCodes: string[];
  onAdd: (code: string) => void;
  onClose: () => void;
}) {
  const available = ALL_LANGUAGES.filter((l) => !enabledCodes.includes(l.code));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Add Language</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-zinc-500 mb-4">Select a language to add to this project:</p>
        <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
          {available.map((l) => (
            <button
              key={l.code}
              onClick={() => { onAdd(l.code); onClose(); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <span className="text-xl">{l.flag}</span>
              <div>
                <p className="text-sm text-white font-medium">{l.name}</p>
                <p className="text-xs text-zinc-500">{l.nativeName}</p>
              </div>
            </button>
          ))}
          {available.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-6">All languages are enabled!</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation ──────────────────────────────────────────────────────

function DeleteConfirmModal({ projectName, onClose }: { projectName: string; onClose: () => void }) {
  const [confirm, setConfirm] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] border border-red-500/30 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
          <h2 className="text-base font-semibold text-white">Delete Project</h2>
        </div>
        <p className="text-sm text-zinc-300 mb-4">
          This will permanently delete <strong className="text-white">{projectName}</strong> and all
          its translation keys and values. This action cannot be undone.
        </p>
        <div className="mb-4">
          <label className="block text-xs text-zinc-400 mb-1.5">
            Type <span className="text-white font-mono">{projectName}</span> to confirm
          </label>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={projectName}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-red-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={confirm !== projectName}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectSettingsPage({ params }: { params: { id: string } }) {
  const [projectName, setProjectName] = useState("My SaaS App");
  const [defaultLocale, setDefaultLocale] = useState("en");
  const [saved, setSaved] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://my-app.com/webhooks/translate");
  const [webhookEvents, setWebhookEvents] = useState({ push: true, coverage: false, error: false });

  const [languages, setLanguages] = useState<EnabledLanguage[]>([
    { code: "fr", enabled: true, coverage: 88 },
    { code: "de", enabled: true, coverage: 62 },
    { code: "es", enabled: true, coverage: 100 },
    { code: "pt", enabled: false, coverage: 34 },
    { code: "ja", enabled: false, coverage: 15 },
  ]);

  const webhookSecret = "wh_sec_tk_9f2a847bc3d1e058f6a";

  function handleSaveProject() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleToggleLang(code: string) {
    setLanguages((prev) =>
      prev.map((l) => (l.code === code ? { ...l, enabled: !l.enabled } : l))
    );
  }

  function handleAddLang(code: string) {
    setLanguages((prev) => [
      ...prev,
      { code, enabled: true, coverage: 0 },
    ]);
  }

  const langData = (code: string) =>
    ALL_LANGUAGES.find((l) => l.code === code) ?? { flag: "🌐", name: code, nativeName: code };

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto space-y-8">
      {showLangPicker && (
        <LanguagePickerModal
          enabledCodes={languages.map((l) => l.code)}
          onAdd={handleAddLang}
          onClose={() => setShowLangPicker(false)}
        />
      )}
      {showDelete && (
        <DeleteConfirmModal
          projectName={projectName}
          onClose={() => setShowDelete(false)}
        />
      )}

      <h1 className="text-2xl font-bold text-white">Project Settings</h1>

      {/* ── General ── */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">General</h2>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Default Locale (source)</label>
          <select
            value={defaultLocale}
            onChange={(e) => setDefaultLocale(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
          >
            <option value="en">🇺🇸 English (en)</option>
            <option value="fr">🇫🇷 French (fr)</option>
            <option value="de">🇩🇪 German (de)</option>
            <option value="es">🇪🇸 Spanish (es)</option>
          </select>
        </div>
        <button
          onClick={handleSaveProject}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: "#4f46e5" }}
        >
          {saved ? <><Check className="h-4 w-4" /> Saved!</> : "Save Changes"}
        </button>
      </section>

      {/* ── Language Configuration ── */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Language Configuration</h2>
          <button
            onClick={() => setShowLangPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            style={{ background: "#4f46e5" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Language
          </button>
        </div>

        <div className="space-y-3">
          {languages.map((lang) => {
            const meta = langData(lang.code);
            return (
              <div
                key={lang.code}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/5"
              >
                <span className="text-2xl">{meta.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-white">{meta.name}</span>
                    <span className="text-xs text-zinc-500">{lang.code.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${lang.coverage}%`,
                          background:
                            lang.coverage >= 80
                              ? "#22c55e"
                              : lang.coverage >= 50
                              ? "#eab308"
                              : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-10 text-right">
                      {lang.coverage}%
                    </span>
                  </div>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => handleToggleLang(lang.code)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    lang.enabled ? "bg-indigo-600" : "bg-white/20"
                  }`}
                  role="switch"
                  aria-checked={lang.enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      lang.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Webhooks ── */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">Webhooks</h2>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Webhook Secret</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-zinc-300">
              {showSecret ? webhookSecret : "•".repeat(webhookSecret.length)}
            </div>
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-2">Events</label>
          <div className="space-y-2">
            {[
              { key: "push" as const, label: "translation.push — fired when AI translations are ready" },
              { key: "coverage" as const, label: "coverage.updated — fired when coverage changes" },
              { key: "error" as const, label: "translation.error — fired on translation failure" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookEvents[key]}
                  onChange={(e) =>
                    setWebhookEvents({ ...webhookEvents, [key]: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <span className="text-sm text-zinc-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: "#4f46e5" }}
        >
          Save Webhook
        </button>
      </section>

      {/* ── Danger Zone ── */}
      <section className="rounded-xl border border-red-500/30 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
        </div>
        <p className="text-sm text-zinc-400">
          Once you delete this project, all translation keys and values will be permanently removed.
          This cannot be undone.
        </p>
        <button
          onClick={() => setShowDelete(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
        >
          Delete Project
        </button>
      </section>
    </div>
  );
}
