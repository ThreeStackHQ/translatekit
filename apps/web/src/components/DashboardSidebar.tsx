"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  FolderOpen,
  Key,
  BarChart2,
  Settings,
  Globe,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  userEmail: string | null | undefined;
}

function SidebarContent({
  userEmail,
  pathname,
  onClose,
}: {
  userEmail: string | null | undefined;
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col" style={{ background: "#0f0f0f" }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <Link href="/dashboard/projects" className="flex items-center gap-2.5">
          <span className="text-2xl">🌐</span>
          <span className="text-base font-bold text-white">TranslateKit</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-zinc-400 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
              style={active ? { background: "#4f46e5" } : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="border-t border-white/10 px-4 py-4 space-y-2">
        <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 shrink-0 h-screen sticky top-0">
        <SidebarContent userEmail={userEmail} pathname={pathname} />
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4 py-3 border-b border-white/10" style={{ background: "#0f0f0f" }}>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-zinc-300 hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="ml-3 text-sm font-bold text-white">TranslateKit</span>
      </div>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-64 h-full shadow-xl">
            <SidebarContent
              userEmail={userEmail}
              pathname={pathname}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
