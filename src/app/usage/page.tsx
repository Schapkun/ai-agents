"use client";

import { useEffect, useState } from "react";
import { CreditCard, Coins, ArrowUpRight, ArrowDownRight, Hash, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type UsageEntry = {
  datum: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  requests: number;
};

type UsageData = {
  entries: UsageEntry[];
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

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function formatKosten(n: number): string {
  return "$" + n.toFixed(4);
}

function formatDatum(datum: string): string {
  const d = new Date(datum + "T00:00:00");
  const dagen = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const maanden = [
    "jan", "feb", "mrt", "apr", "mei", "jun",
    "jul", "aug", "sep", "okt", "nov", "dec",
  ];
  return `${dagen[d.getDay()]} ${d.getDate()} ${maanden[d.getMonth()]}`;
}

const usageHeader = (
  <div>
    <h1 className="text-base font-semibold tracking-tight">Usage</h1>
    <p className="text-[10px] text-[#acacbe]">API gebruik &amp; geschatte kosten</p>
  </div>
);

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d: UsageData) => {
        setData(d);
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, []);

  const entries = data?.entries ?? [];

  const nu = new Date();
  const huidigeMaand = `${nu.getFullYear()}-${String(nu.getMonth() + 1).padStart(2, "0")}`;
  const maandEntries = entries.filter((e) => e.datum.startsWith(huidigeMaand));

  const totaalInput = maandEntries.reduce((s, e) => s + e.input_tokens, 0);
  const totaalOutput = maandEntries.reduce((s, e) => s + e.output_tokens, 0);
  const totaalRequests = maandEntries.reduce((s, e) => s + e.requests, 0);
  const totaalKosten = maandEntries.reduce(
    (s, e) => s + berekenKosten(e.model, e.input_tokens, e.output_tokens),
    0
  );

  const perModel: Record<string, { input: number; output: number; requests: number; kosten: number }> = {};
  for (const e of maandEntries) {
    if (!perModel[e.model]) {
      perModel[e.model] = { input: 0, output: 0, requests: 0, kosten: 0 };
    }
    perModel[e.model].input += e.input_tokens;
    perModel[e.model].output += e.output_tokens;
    perModel[e.model].requests += e.requests;
    perModel[e.model].kosten += berekenKosten(e.model, e.input_tokens, e.output_tokens);
  }

  const perDag: Record<string, { input: number; output: number; requests: number; kosten: number }> = {};
  for (const e of maandEntries) {
    if (!perDag[e.datum]) {
      perDag[e.datum] = { input: 0, output: 0, requests: 0, kosten: 0 };
    }
    perDag[e.datum].input += e.input_tokens;
    perDag[e.datum].output += e.output_tokens;
    perDag[e.datum].requests += e.requests;
    perDag[e.datum].kosten += berekenKosten(e.model, e.input_tokens, e.output_tokens);
  }
  const dagLijst = Object.entries(perDag)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14);

  return (
    <DashboardLayout header={usageHeader}>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#acacbe] animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 mb-3">
                <CreditCard className="h-5 w-5 text-[#acacbe]" />
              </div>
              <p className="text-sm text-[#acacbe]">Nog geen usage data</p>
              <p className="text-xs text-[#acacbe]/60 mt-1">
                Token gebruik wordt automatisch bijgehouden bij elk chatgesprek
              </p>
            </div>
          ) : (
            <>
              {/* Statistieken kaarten */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Geschatte kosten", waarde: formatKosten(totaalKosten), icon: Coins },
                  { label: "Input tokens", waarde: formatTokens(totaalInput), icon: ArrowUpRight },
                  { label: "Output tokens", waarde: formatTokens(totaalOutput), icon: ArrowDownRight },
                  { label: "Requests", waarde: totaalRequests.toString(), icon: Hash },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-[#40414f] rounded-2xl border border-[#4d4d4f] px-5 py-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-white/5">
                          <Icon className="h-3.5 w-3.5 text-[#acacbe]" />
                        </div>
                        <span className="text-[10px] text-[#acacbe] uppercase tracking-wider">
                          {stat.label}
                        </span>
                      </div>
                      <p className="text-xl font-semibold text-white font-mono">
                        {stat.waarde}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Per model breakdown */}
              {Object.keys(perModel).length > 0 && (
                <div className="bg-[#40414f] rounded-2xl border border-[#4d4d4f] overflow-hidden mb-8">
                  <div className="px-5 py-4 border-b border-[#4d4d4f]">
                    <h2 className="text-sm font-medium text-white">Per model</h2>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#4d4d4f]">
                        <th className="text-left px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Model</th>
                        <th className="text-right px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Input</th>
                        <th className="text-right px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Output</th>
                        <th className="text-right px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Requests</th>
                        <th className="text-right px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Kosten</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(perModel).map(([model, stats]) => (
                        <tr key={model} className="border-b border-[#4d4d4f]/50 hover:bg-[#4d4d4f]/30 transition-colors">
                          <td className="px-5 py-3 text-sm text-white font-mono">{model}</td>
                          <td className="px-5 py-3 text-right text-sm text-[#acacbe] font-mono">{formatTokens(stats.input)}</td>
                          <td className="px-5 py-3 text-right text-sm text-[#acacbe] font-mono">{formatTokens(stats.output)}</td>
                          <td className="px-5 py-3 text-right text-sm text-[#acacbe] font-mono">{stats.requests}</td>
                          <td className="px-5 py-3 text-right text-sm text-white font-mono">{formatKosten(stats.kosten)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Dagelijks overzicht */}
              {dagLijst.length > 0 && (
                <div className="bg-[#40414f] rounded-2xl border border-[#4d4d4f] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#4d4d4f]">
                    <h2 className="text-sm font-medium text-white">Dagelijks overzicht</h2>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#4d4d4f]">
                        <th className="text-left px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Datum</th>
                        <th className="text-right px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Input</th>
                        <th className="text-right px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Output</th>
                        <th className="text-right px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Requests</th>
                        <th className="text-right px-5 py-3 text-[10px] font-medium text-[#acacbe] uppercase tracking-wider">Kosten</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dagLijst.map(([datum, stats]) => (
                        <tr key={datum} className="border-b border-[#4d4d4f]/50 hover:bg-[#4d4d4f]/30 transition-colors">
                          <td className="px-5 py-3 text-sm text-white">{formatDatum(datum)}</td>
                          <td className="px-5 py-3 text-right text-sm text-[#acacbe] font-mono">{formatTokens(stats.input)}</td>
                          <td className="px-5 py-3 text-right text-sm text-[#acacbe] font-mono">{formatTokens(stats.output)}</td>
                          <td className="px-5 py-3 text-right text-sm text-[#acacbe] font-mono">{stats.requests}</td>
                          <td className="px-5 py-3 text-right text-sm text-white font-mono">{formatKosten(stats.kosten)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
