"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { agents, slagingspercentage } from "@/lib/agents";

type LogboekEntry = {
  datum: string;
  inhoud: string;
  categorie: string;
};

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

const totaalGebruikt = agents.reduce((s, a) => s + a.gebruikt, 0);
const totaalGeslaagd = agents.reduce((s, a) => s + a.geslaagd, 0);

const overzichtHeader = (
  <div>
    <h1 className="text-sm font-semibold tracking-tight">Overzicht</h1>
    <p className="text-[10px] text-zinc-500">
      {agents.length} agents &middot; {totaalGebruikt} gebruikt &middot; {totaalGeslaagd} geslaagd
    </p>
  </div>
);

function formatDatum(datum: string): string {
  const d = new Date(datum + "T00:00:00");
  const dagen = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const maanden = [
    "jan", "feb", "mrt", "apr", "mei", "jun",
    "jul", "aug", "sep", "okt", "nov", "dec",
  ];
  return `${dagen[d.getDay()]} ${d.getDate()} ${maanden[d.getMonth()]}`;
}

export default function OverzichtPage() {
  const [recenteEntries, setRecenteEntries] = useState<LogboekEntry[]>([]);

  useEffect(() => {
    fetch("/api/logboek")
      .then((r) => r.json())
      .then((data: LogboekEntry[]) => {
        if (Array.isArray(data)) {
          setRecenteEntries(data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout activePage="overzicht" header={overzichtHeader}>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Agents tabel */}
          <div className="rounded-xl border border-zinc-800/40 overflow-hidden mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/40 bg-zinc-900/40">
                  <th className="text-left px-5 py-3 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Agent</th>
                  <th className="text-right px-5 py-3 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Gebruikt ({totaalGebruikt})</th>
                  <th className="text-right px-5 py-3 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Geslaagd ({totaalGeslaagd})</th>
                  <th className="text-left px-5 py-3 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Percentage</th>
                  <th className="text-center px-5 py-3 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Trend</th>
                  <th className="text-right px-5 py-3 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Laatste activiteit</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
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
                            <p className="text-[10px] text-zinc-500">{agent.beschrijving}</p>
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
                        <span className="text-[10px] text-zinc-500">{agent.laatsteActiviteit}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recente activiteit */}
          <div className="rounded-xl border border-zinc-800/40 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/40 bg-zinc-900/40">
              <h2 className="text-sm font-medium text-zinc-300">Recente activiteit</h2>
            </div>
            {recenteEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700/30 mb-3">
                  <Activity className="h-5 w-5 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-500">Nog geen activiteit</p>
                <p className="text-[10px] text-zinc-600 mt-1">
                  Activiteit van agents verschijnt hier automatisch
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/20">
                {recenteEntries.map((entry) => {
                  const eersteRegel = entry.inhoud.split("\n").find((r) => r.trim() && !r.startsWith("#")) || entry.datum;
                  return (
                    <div
                      key={entry.datum}
                      className="flex items-center justify-between px-5 py-3 hover:bg-zinc-900/40 transition-colors"
                    >
                      <p className="text-sm text-zinc-300 truncate max-w-md">{eersteRegel.replace(/^[-*]\s*/, "").trim()}</p>
                      <span className="text-[10px] text-zinc-600 shrink-0 ml-4">{formatDatum(entry.datum)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
