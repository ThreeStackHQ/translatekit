"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function WorkspaceSettingsPage() {
  const [name, setName] = useState("My Workspace");
  const [email, setEmail] = useState("user@example.com");
  const [saved, setSaved] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Workspace Settings</h1>

      {/* Profile */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">Profile</h2>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Workspace Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: "#4f46e5" }}
        >
          {saved ? <><Check className="h-4 w-4" /> Saved!</> : "Save Changes"}
        </button>
      </section>

      {/* Password */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">Change Password</h2>
        {[
          { label: "Current Password", field: "current" as const, placeholder: "••••••••" },
          { label: "New Password", field: "next" as const, placeholder: "Min 8 characters" },
          { label: "Confirm Password", field: "confirm" as const, placeholder: "Repeat new password" },
        ].map(({ label, field, placeholder }) => (
          <div key={field}>
            <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
            <input
              type="password"
              value={pwd[field]}
              onChange={(e) => setPwd({ ...pwd, [field]: e.target.value })}
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500"
            />
          </div>
        ))}
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: "#4f46e5" }}>
          Update Password
        </button>
      </section>

      {/* Plan */}
      <section className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-3">
        <h2 className="text-base font-semibold text-white">Billing & Plan</h2>
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
          <div>
            <p className="text-sm font-medium text-white">Starter Plan</p>
            <p className="text-xs text-zinc-400 mt-0.5">$9/mo · 10 projects · 10,000 keys</p>
          </div>
          <a
            href="/pricing"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            style={{ background: "#4f46e5" }}
          >
            Upgrade
          </a>
        </div>
      </section>
    </div>
  );
}
