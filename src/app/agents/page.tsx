"use client";

import {
  Bot,
  MessageSquare,
  LayoutTemplate,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  Code,
  Wrench,
  Palette,
  RefreshCw,
  FolderPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type AgentInfo = {
  id: string;
  naam: string;
  beschrijving: string;
  icon: LucideIcon;
  kleur: string;
  bgKleur: string;
  gebruikt: number;
  geslaagd: number;
  trend: "up" | "down" | "stable";
};

const agentData: AgentInfo[] = [
  { id: "feature-agent", naam: "Feature Agent", beschrijving: "Bouw een volledig nieuwe functionaliteit van ontwerp tot oplevering", icon: Code, kleur: "text-violet-400", bgKleur: "bg-violet-400/10", gebruikt: 0, geslaagd: 0, trend: "stable" },
  { id: "fix-agent", naam: "Fix Agent", beschrijving: "Diagnose en oplossing van bugs, fouten en onverwacht gedrag", icon: Wrench, kleur: "text-orange-400", bgKleur: "bg-orange-400/10", gebruikt: 0, geslaagd: 0, trend: "stable" },
  { id: "design-agent", naam: "Design Agent", beschrijving: "UI/UX aanpassingen, visuele verbeteringen en layout wijzigingen", icon: Palette, kleur: "text-pink-400", bgKleur: "bg-pink-400/10", gebruikt: 0, geslaagd: 0, trend: "stable" },
  { id: "refactor-agent", naam: "Refactor Agent", beschrijving: "Code herstructureren voor betere leesbaarheid en onderhoudbaarheid", icon: RefreshCw, kleur: "text-cyan-400", bgKleur: "bg-cyan-400/10", gebruikt: 0, geslaagd: 0, trend: "stable" },
  { id: "setup-agent", naam: "Setup Agent", beschrijving: "Nieuw project initialiseren met tooling, configuratie en structuur", icon: FolderPlus, kleur: "text-teal-400", bgKleur: "bg-teal-400/10", gebruikt: 0, geslaagd: 0, trend: "stable" },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-zinc-500" />;
}

function ProgressBar({ gebruikt, geslaagd }: { gebruikt: number; geslaagd: number }) {
  const pct = gebruikt === 0 ? 0 : Math.round((geslaagd / gebruikt) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-24 rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400 font-mono w-8 text-right">{gebruikt === 0 ? "-" : pct + "%"}</span>
    </div>
  );
}

export default function AgentsPage() {
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
          <Link href="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors">
            <MessageSquare className="h-4 w-4" />
            Chat
          </Link>
          <Link href="/agents" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white bg-zinc-800/60">
            <LayoutTemplate className="h-4 w-4 text-zinc-400" />
            Agents
          </Link>
          <Link href="/logboek" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors">
            <BookOpen className="h-4 w-4" />
            Logboek
          </Link>
        </nav>

        <div className="flex-1" />

        <div className="border-t border-zinc-800/60 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[10px] font-bold">M</div>
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
            <h1 className="text-xl font-semibold tracking-tight">Agents</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {agentData.length} agents &middot; slagingspercentages
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/40 px-5 py-4">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Agents</p>
              <p className="text-2xl font-semibold mt-1">{agentData.length}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/40 px-5 py-4">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Totaal gebruikt</p>
              <p className="text-2xl font-semibold mt-1">{agentData.reduce((s, a) => s + a.gebruikt, 0)}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/40 px-5 py-4">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Totaal geslaagd</p>
              <p className="text-2xl font-semibold mt-1 text-emerald-400">{agentData.reduce((s, a) => s + a.geslaagd, 0)}</p>
            </div>
          </div>

          {/* Tabel */}
          <div className="rounded-xl border border-zinc-800/40 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/40 bg-zinc-900/40">
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Agent</th>
                  <th className="text-right px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Gebruikt</th>
                  <th className="text-right px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Geslaagd</th>
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Percentage</th>
                  <th className="text-center px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody>
                {agentData.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <tr key={agent.id} className="border-b border-zinc-800/20 hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${agent.bgKleur}`}>
                            <Icon className={`h-4 w-4 ${agent.kleur}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{agent.naam}</p>
                            <p className="text-[11px] text-zinc-500">{agent.beschrijving}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm text-zinc-300 font-mono">{agent.gebruikt}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm text-zinc-300 font-mono">{agent.geslaagd}</span>
                      </td>
                      <td className="px-5 py-3">
                        <ProgressBar gebruikt={agent.gebruikt} geslaagd={agent.geslaagd} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex justify-center">
                          <TrendIcon trend={agent.trend} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
