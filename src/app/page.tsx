"use client";

import {
  Bot,
  MessageSquare,
  LayoutTemplate,
  BookOpen,
  BarChart3,
  Activity,
  FolderKanban,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Taken uitgevoerd",
    waarde: "0",
    icon: Zap,
    kleur: "text-blue-400",
    bgKleur: "bg-blue-400/10",
  },
  {
    label: "Slagingspercentage",
    waarde: "-",
    icon: BarChart3,
    kleur: "text-emerald-400",
    bgKleur: "bg-emerald-400/10",
  },
  {
    label: "Actieve projecten",
    waarde: "6",
    icon: FolderKanban,
    kleur: "text-violet-400",
    bgKleur: "bg-violet-400/10",
  },
  {
    label: "Laatste activiteit",
    waarde: "-",
    icon: Clock,
    kleur: "text-orange-400",
    bgKleur: "bg-orange-400/10",
  },
];

const recenteActiviteit: { tekst: string; tijd: string; type: string }[] = [];

export default function OverzichtPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-zinc-800/60 bg-zinc-900/40">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-white/10">
            <Bot className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">Mattie</span>
            <p className="text-[10px] text-zinc-500">Dashboard</p>
          </div>
        </div>

        <nav className="px-3 pt-3 pb-1 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white bg-zinc-800/60"
          >
            <Activity className="h-4 w-4 text-zinc-400" />
            Overzicht
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Link>
          <Link
            href="/agents"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
          >
            <LayoutTemplate className="h-4 w-4" />
            Agents
          </Link>
          <Link
            href="/logboek"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Logboek
          </Link>
        </nav>

        <div className="flex-1" />

        <div className="border-t border-zinc-800/60 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[10px] font-bold">
              M
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-300">Michael</p>
              <p className="text-[10px] text-zinc-500">Eigenaar</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight">Overzicht</h1>
            <p className="text-sm text-zinc-500 mt-1">Dashboard &middot; alle agents en projecten</p>
          </div>

          {/* Stat kaarten */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl bg-zinc-900/60 border border-zinc-800/40 px-5 py-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.bgKleur}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${stat.kleur}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold">{stat.waarde}</p>
                </div>
              );
            })}
          </div>

          {/* Recente activiteit */}
          <div className="rounded-xl border border-zinc-800/40 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/40 bg-zinc-900/40">
              <h2 className="text-sm font-medium text-zinc-300">Recente activiteit</h2>
            </div>
            {recenteActiviteit.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700/30 mb-3">
                  <Activity className="h-5 w-5 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-500">Nog geen activiteit</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Activiteit van agents verschijnt hier automatisch
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/20">
                {recenteActiviteit.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-5 py-3 hover:bg-zinc-900/40 transition-colors"
                  >
                    <p className="text-sm text-zinc-300">{item.tekst}</p>
                    <span className="text-[11px] text-zinc-600">{item.tijd}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
