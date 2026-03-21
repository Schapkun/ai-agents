"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Code,
  Wrench,
  Palette,
  RefreshCw,
  FolderPlus,
  Shield,
  type LucideIcon,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

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
  laatsteActiviteit: string;
};

const agentData: AgentInfo[] = [
  { id: "feature-agent", naam: "Feature Agent", beschrijving: "Bouw een volledig nieuwe functionaliteit van ontwerp tot oplevering", icon: Code, kleur: "text-violet-400", bgKleur: "bg-violet-400/10", gebruikt: 0, geslaagd: 0, trend: "stable", laatsteActiviteit: "-" },
  { id: "fix-agent", naam: "Fix Agent", beschrijving: "Diagnose en oplossing van bugs, fouten en onverwacht gedrag", icon: Wrench, kleur: "text-orange-400", bgKleur: "bg-orange-400/10", gebruikt: 0, geslaagd: 0, trend: "stable", laatsteActiviteit: "-" },
  { id: "design-agent", naam: "Design Agent", beschrijving: "UI/UX aanpassingen, visuele verbeteringen en layout wijzigingen", icon: Palette, kleur: "text-pink-400", bgKleur: "bg-pink-400/10", gebruikt: 0, geslaagd: 0, trend: "stable", laatsteActiviteit: "-" },
  { id: "refactor-agent", naam: "Refactor Agent", beschrijving: "Code herstructureren voor betere leesbaarheid en onderhoudbaarheid", icon: RefreshCw, kleur: "text-cyan-400", bgKleur: "bg-cyan-400/10", gebruikt: 0, geslaagd: 0, trend: "stable", laatsteActiviteit: "-" },
  { id: "setup-agent", naam: "Setup Agent", beschrijving: "Nieuw project initialiseren met tooling, configuratie en structuur", icon: FolderPlus, kleur: "text-teal-400", bgKleur: "bg-teal-400/10", gebruikt: 0, geslaagd: 0, trend: "stable", laatsteActiviteit: "-" },
  { id: "review", naam: "Review Agent", beschrijving: "Onafhankelijke controle van werk door andere agents", icon: Shield, kleur: "text-green-400", bgKleur: "bg-green-400/10", gebruikt: 0, geslaagd: 0, trend: "stable", laatsteActiviteit: "-" },
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

const agentsHeader = (
  <div>
    <h1 className="text-sm font-semibold tracking-tight">Agents</h1>
    <p className="text-[11px] text-zinc-500">
      {agentData.length} agents &middot; {agentData.reduce((s, a) => s + a.gebruikt, 0)} gebruikt &middot; {agentData.reduce((s, a) => s + a.geslaagd, 0)} geslaagd
    </p>
  </div>
);

export default function AgentsPage() {
  return (
    <DashboardLayout activePage="agents" header={agentsHeader}>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
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
                  <th className="text-right px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Laatste activiteit</th>
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
                      <td className="px-5 py-3 text-right">
                        <span className="text-[11px] text-zinc-500">{agent.laatsteActiviteit}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
