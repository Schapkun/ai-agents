"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { agents } from "@/lib/agents";

type LogboekEntry = {
  datum: string;
  inhoud: string;
  categorie: string;
};

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
  const [kostenMaand, setKostenMaand] = useState<number>(0);
  const [chatsVandaag, setChatsVandaag] = useState<number>(0);

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

  useEffect(() => {
    fetch("/api/logboek")
      .then((r) => r.json())
      .then((data: LogboekEntry[]) => {
        if (Array.isArray(data)) {
          setRecenteEntries(data.slice(0, 3));
        }
      })
      .catch(() => {});

    fetch("/api/usage")
      .then((r) => r.json())
      .then((data: { entries: { datum: string; model: string; input_tokens: number; output_tokens: number; requests: number }[] }) => {
        const nu = new Date();
        const huidigeMaand = `${nu.getFullYear()}-${String(nu.getMonth() + 1).padStart(2, "0")}`;
        const vandaag = nu.toISOString().slice(0, 10);
        const maandEntries = data.entries?.filter((e: { datum: string }) => e.datum.startsWith(huidigeMaand)) ?? [];
        const kosten = maandEntries.reduce(
          (s: number, e: { model: string; input_tokens: number; output_tokens: number }) => s + berekenKosten(e.model, e.input_tokens, e.output_tokens),
          0
        );
        setKostenMaand(kosten);
        const vandaagRequests = maandEntries.filter((e: { datum: string }) => e.datum === vandaag).reduce((s: number, e: { requests: number }) => s + e.requests, 0);
        setChatsVandaag(vandaagRequests);
      })
      .catch(() => {});
  }, []);

  const actieveAgents = agents.filter((a) => a.gebruikt > 0).length || agents.length;

  const statCards = [
    { label: "Actieve agents", waarde: actieveAgents.toString() },
    { label: "Chats vandaag", waarde: chatsVandaag.toString() },
    { label: "Kosten deze maand", waarde: "$" + kostenMaand.toFixed(2) },
  ];

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Overzicht</h1>
            <p className="text-sm text-[#acacbe]">{agents.length} agents actief</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#40414f] rounded-2xl border border-[#4d4d4f] px-5 py-5"
              >
                <p className="text-xs text-[#acacbe] uppercase tracking-wider mb-2">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.waarde}</p>
              </div>
            ))}
          </div>

          {/* Agents lijst */}
          <div className="bg-[#40414f] rounded-2xl border border-[#4d4d4f] overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-[#4d4d4f]">
              <h2 className="text-sm font-medium text-white">Agents</h2>
            </div>
            <div className="divide-y divide-[#4d4d4f]/50">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const isActief = agent.gebruikt > 0;
                return (
                  <div key={agent.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#4d4d4f]/30 transition-colors">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${agent.bgKleur}`}>
                      <Icon className={`h-4 w-4 ${agent.kleur}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{agent.naam}</p>
                      <p className="text-xs text-[#acacbe] truncate">{agent.beschrijving}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isActief ? "bg-green-500" : "bg-[#acacbe]/40"}`} />
                      <span className="text-xs text-[#acacbe]">{isActief ? "Actief" : "Standby"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recente activiteit */}
          <div className="bg-[#40414f] rounded-2xl border border-[#4d4d4f] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#4d4d4f]">
              <h2 className="text-sm font-medium text-white">Recente activiteit</h2>
            </div>
            {recenteEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 mb-3">
                  <Activity className="h-5 w-5 text-[#acacbe]" />
                </div>
                <p className="text-sm text-[#acacbe]">Nog geen activiteit</p>
                <p className="text-xs text-[#acacbe]/60 mt-1">
                  Activiteit van agents verschijnt hier automatisch
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#4d4d4f]/50">
                {recenteEntries.map((entry) => {
                  const eersteRegel = entry.inhoud.split("\n").find((r: string) => r.trim() && !r.startsWith("#")) || entry.datum;
                  return (
                    <div
                      key={entry.datum}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-[#4d4d4f]/30 transition-colors"
                    >
                      <p className="text-sm text-white/80 truncate max-w-md">{eersteRegel.replace(/^[-*]\s*/, "").trim()}</p>
                      <span className="text-xs text-[#acacbe] shrink-0 ml-4">{formatDatum(entry.datum)}</span>
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
