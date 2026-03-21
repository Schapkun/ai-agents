"use client";

import {
  Activity,
  MessageSquare,
  CheckSquare,
  Lightbulb,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { APP_NAME } from "@/lib/config";

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

const navItems = [
  { href: "/", label: "Overzicht", icon: Activity },
  { href: "/mattie", label: "Chat met Mattie", icon: MessageSquare },
  { href: "/taken", label: "Taken", icon: CheckSquare },
  { href: "/ideeen", label: "Idee\u00ebn", icon: Lightbulb },
];

function UsageWidget() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data: { entries: { datum: string; model: string; input_tokens: number; output_tokens: number; requests: number }[] }) => {
        const nu = new Date();
        const huidigeMaand = `${nu.getFullYear()}-${String(nu.getMonth() + 1).padStart(2, "0")}`;
        const maandEntries = data.entries?.filter((e: { datum: string }) => e.datum.startsWith(huidigeMaand)) ?? [];
        const totaalTokens = maandEntries.reduce((s: number, e: { input_tokens: number; output_tokens: number }) => s + e.input_tokens + e.output_tokens, 0);
        const totaalKosten = maandEntries.reduce(
          (s: number, e: { model: string; input_tokens: number; output_tokens: number }) => s + berekenKosten(e.model, e.input_tokens, e.output_tokens),
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
      className="flex items-center gap-2.5 mx-3 px-3 py-2 rounded-xl text-[#acacbe] hover:text-white hover:bg-[#40414f] transition-all"
    >
      <CreditCard className="h-4 w-4 shrink-0" />
      <span className="text-xs font-mono">
        ${usage.totaalKosten.toFixed(2)} \u00b7 {formatTokensCompact(usage.totaalTokens)}
      </span>
    </Link>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarExtra?: ReactNode;
  header?: ReactNode;
}

export default function DashboardLayout({
  children,
  sidebarExtra,
  header,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#343541] text-white">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-[#202123] shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
            <p className="text-[10px] text-[#acacbe]">Dashboard</p>
          </div>
        </div>

        {/* Navigatie */}
        <nav className="px-3 pt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "font-medium text-white bg-[#40414f]"
                    : "text-[#acacbe] hover:text-white hover:bg-[#40414f]/50"
                }`}
              >
                <Icon className="h-4 w-4" />
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
        <div className="pb-4">
          <UsageWidget />
        </div>
      </aside>

      {/* Content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {header && (
          <div className="flex items-center gap-3 border-b border-[#4d4d4f] px-6 h-14 shrink-0 bg-[#343541]">
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
