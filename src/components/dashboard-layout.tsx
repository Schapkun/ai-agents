"use client";

import {
  Bot,
  MessageSquare,
  BookOpen,
  Activity,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type ActivePage = "overzicht" | "mattie" | "logboek";

const navItems: { href: string; label: string; icon: typeof Activity; page: ActivePage }[] = [
  { href: "/", label: "Overzicht", icon: Activity, page: "overzicht" },
  { href: "/mattie", label: "Mattie", icon: MessageSquare, page: "mattie" },
  { href: "/logboek", label: "Logboek", icon: BookOpen, page: "logboek" },
];

interface DashboardLayoutProps {
  activePage: ActivePage;
  children: ReactNode;
  sidebarExtra?: ReactNode;
  header?: ReactNode;
}

export default function DashboardLayout({
  activePage,
  children,
  sidebarExtra,
  header,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-zinc-800/60 bg-zinc-900/40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 shrink-0 border-b border-zinc-800/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-white/10">
            <Bot className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight">Agents</span>
            <p className="text-[10px] text-zinc-500">Dashboard</p>
          </div>
        </div>

        {/* Navigatie */}
        <nav className="px-3 pt-3 pb-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.page === activePage;
            return (
              <Link
                key={item.page}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "font-medium text-white bg-zinc-800/60"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-zinc-400" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Extra sidebar content */}
        {sidebarExtra}

        {/* Spacer — laat navigatie bovenaan en sidebar ademen zonder onderste lijn (Apple-stijl) */}
        <div className="flex-1" />

      </aside>

      {/* Content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {header && (
          <div className="flex items-center gap-3 border-b border-zinc-800/60 px-6 h-14 shrink-0">
            {header}
          </div>
        )}
        <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
