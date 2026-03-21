"use client";

import {
  Bot,
  MessageSquare,
  BookOpen,
  Activity,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { APP_NAME, APP_SUBTITLE } from "@/lib/config";

type ActivePage = "overzicht" | "mattie" | "logboek";

type UsageSummary = {
  totaalKosten: number;
  totaalTokens: number;
};

const PRIJZEN: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  "claude-haiku-3-5": { input: 0.8, output: 4 },
  "claude-opus-4-6": { input: 15, output: 75 },
};

function berekenKosten(model: string, inputTokens: number, outputTokens: number): number {
  const key = Object.keys(PRIJZEN).find((k) => model.includes(k) || k.includes(model));
  const prijs = key ? PRIJZEN[key] : { input: 3, output: 15 };
  return (inputTokens / 1_000_000) * prijs.input + (outputTokens / 1_000_000) * prijs.output;
}

function formatTokensCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "K";
  return n.toString();
}

const navItems: { href: string; label: string; icon: typeof Activity; page: ActivePage }[] = [
  { href: "/", label: "Overzicht", icon: Activity, page: "overzicht" },
  { href: "/mattie", label: "Mattie", icon: MessageSquare, page: "mattie" },
  { href: "/logboek", label: "Logboek", icon: BookOpen, page: "logboek" },
];

function UsageWidget() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data: { entries: { datum: string; model: string; input_tokens: number; output_tokens: number; requests: number }[] }) => {
        const nu = new Date();
        const huidigeMaand = `${nu.getFullYear()}-${String(nu.getMonth() + 1).padStart(2, "0")}`;
        const maandEntries = data.entries?.filter((e) => e.datum.startsWith(huidigeMaand)) ?? [];
        const totaalTokens = maandEntries.reduce((s, e) => s + e.input_tokens + e.output_tokens, 0);
        const totaalKosten = maandEntries.reduce(
          (s, e) => s + berekenKosten(e.model, e.input_tokens, e.output_tokens),
          0
        );
        setUsage({ totaalKosten, totaalTokens });
      })
      .catch(() => {});
  }, []);

  if (!usage) return null;

  return (
    <Link
      href="/usage"
      className="flex items-center gap-2 px-4 py-2.5 text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors border-t border-zinc-800/60"
    >
      <CreditCard className="h-3 w-3 shrink-0" />
      <span className="font-mono">
        ${usage.totaalKosten.toFixed(2)} · {formatTokensCompact(usage.totaalTokens)} tokens
      </span>
    </Link>
  );
}

interface DashboardLayoutProps {
  activePage?: ActivePage;
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
            <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
            <p className="text-[10px] text-zinc-500">{APP_SUBTITLE}</p>
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Usage widget */}
        <UsageWidget />

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
