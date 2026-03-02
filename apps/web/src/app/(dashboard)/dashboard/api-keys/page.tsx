"use client";

import { useState } from "react";
import { Plus, Copy, Trash2, Eye, EyeOff, X, Check } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsed: string | null;
  createdAt: string;
  rateLimit: number;
}

const MOCK_KEYS: ApiKey[] = [
  {
    id: "k1",
    name: "Production",
    prefix: "tk_live_9f2a847b",
    lastUsed: "2 hours ago",
    createdAt: "Jan 12, 2024",
    rateLimit: 1000,
  },
  {
    id: "k2",
    name: "Staging",
    prefix: "tk_live_3c8e61d2",
    lastUsed: "3 days ago",
    createdAt: "Jan 8, 2024",
    rateLimit: 100,
  },
];

function CreateKeyModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, limit: number) => void }) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState(1000);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCreate() {
    const key = `tk_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    setNewKey(key);
    onCreate(name, limit);
  }

  function handleCopy() {
    if (newKey) {
      void navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Create API Key</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {newKey ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
              <p className="text-xs text-yellow-400 font-medium mb-1">⚠️ Copy this key now — it won&apos;t be shown again</p>
              <p className="text-xs text-zinc-400">Store it in your environment variables immediately.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-indigo-300 overflow-hidden text-ellipsis">
                {newKey}
              </div>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: "#4f46e5" }}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Key Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Rate Limit (requests/min)</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
              >
                <option value={100}>100 req/min</option>
                <option value={1000}>1,000 req/min</option>
                <option value={10000}>10,000 req/min</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ background: "#4f46e5" }}
              >
                Create Key
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [showCreate, setShowCreate] = useState(false);

  function handleCreate(name: string, rateLimit: number) {
    setKeys((prev) => [
      ...prev,
      {
        id: `k${Date.now()}`,
        name,
        prefix: `tk_live_${Math.random().toString(36).slice(2, 10)}`,
        lastUsed: null,
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        rateLimit,
      },
    ]);
  }

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      {showCreate && <CreateKeyModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-zinc-400 text-sm mt-1">Authenticate CDN API & webhook calls</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: "#4f46e5" }}
        >
          <Plus className="h-4 w-4" />
          Create Key
        </button>
      </div>

      {/* Quick-start */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-5 mb-6">
        <p className="text-xs text-zinc-400 mb-2 font-medium">Quick Start</p>
        <pre className="text-xs text-indigo-300 font-mono overflow-x-auto">
{`curl https://cdn.translatekit.threestack.io/v1/{project}/{locale}.json \\
  -H "Authorization: Bearer tk_live_..."`}
        </pre>
      </div>

      {/* Keys table */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Name", "Key Prefix", "Rate Limit", "Last Used", "Created", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-zinc-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-sm font-medium text-white">{k.name}</td>
                <td className="px-5 py-3">
                  <span className="font-mono text-xs text-indigo-300">{k.prefix}...</span>
                </td>
                <td className="px-5 py-3 text-xs text-zinc-400">{k.rateLimit.toLocaleString()}/min</td>
                <td className="px-5 py-3 text-xs text-zinc-400">{k.lastUsed ?? "Never"}</td>
                <td className="px-5 py-3 text-xs text-zinc-400">{k.createdAt}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setKeys((prev) => prev.filter((x) => x.id !== k.id))}
                    className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-500 text-sm">
                  No API keys yet. Create your first key to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
