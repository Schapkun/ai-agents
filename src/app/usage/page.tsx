"use client";

import { useEffect, useState } from "react";
import { CreditCard, Coins, ArrowUpRight, ArrowDownRight, Hash, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader, SectionCard, Th, Td, Tr, EmptyState, colors } from "@/components/ui/design";

type UsageEntry = { datum: string; model: string; input_tokens: number; output_tokens: number; requests: number };

const PRIJZEN: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  "claude-haiku-3-5": { input: 0.8, output: 4 },
  "claude-opus-4-6": { input: 15, output: 75 },
};

function berekenKosten(model: string, it: number, ot: number): number {
  const k = Object.keys(PRIJZEN).find(k => model.includes(k) || k.includes(model));
  const p = k ? PRIJZEN[k] : { input: 3, output: 15 };
  return (it / 1e6) * p.input + (ot / 1e6) * p.output;
}

function fmtTokens(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function fmtKosten(n: number): string { return "$" + n.toFixed(4); }

function fmtDatum(datum: string): string {
  const d = new Date(datum + "T00:00:00");
  const dagen = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const maanden = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${dagen[d.getDay()]} ${d.getDate()} ${maanden[d.getMonth()]}`;
}

export default function UsagePage() {
  const [entries, setEntries] = useState<UsageEntry[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    fetch("/api/usage").then(r => r.json()).then(d => { setEntries(d.entries ?? []); setLaden(false); }).catch(() => setLaden(false));
  }, []);

  const hm = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const me = entries.filter(e => e.datum.startsWith(hm));
  const totI = me.reduce((s, e) => s + e.input_tokens, 0);
  const totO = me.reduce((s, e) => s + e.output_tokens, 0);
  const totR = me.reduce((s, e) => s + e.requests, 0);
  const totK = me.reduce((s, e) => s + berekenKosten(e.model, e.input_tokens, e.output_tokens), 0);

  const perModel: Record<string, { input: number; output: number; requests: number; kosten: number }> = {};
  for (const e of me) {
    if (!perModel[e.model]) perModel[e.model] = { input: 0, output: 0, requests: 0, kosten: 0 };
    perModel[e.model].input += e.input_tokens;
    perModel[e.model].output += e.output_tokens;
    perModel[e.model].requests += e.requests;
    perModel[e.model].kosten += berekenKosten(e.model, e.input_tokens, e.output_tokens);
  }

  const perDag: Record<string, { input: number; output: number; requests: number; kosten: number }> = {};
  for (const e of me) {
    if (!perDag[e.datum]) perDag[e.datum] = { input: 0, output: 0, requests: 0, kosten: 0 };
    perDag[e.datum].input += e.input_tokens;
    perDag[e.datum].output += e.output_tokens;
    perDag[e.datum].requests += e.requests;
    perDag[e.datum].kosten += berekenKosten(e.model, e.input_tokens, e.output_tokens);
  }
  const dagLijst = Object.entries(perDag).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14);

  const stats = [
    { label: "Geschatte kosten", value: fmtKosten(totK), icon: Coins },
    { label: "Input tokens", value: fmtTokens(totI), icon: ArrowUpRight },
    { label: "Output tokens", value: fmtTokens(totO), icon: ArrowDownRight },
    { label: "Requests", value: totR.toString(), icon: Hash },
  ];

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-6 py-6">
          <PageHeader title="Usage" subtitle="API gebruik & geschatte kosten" />
          {laden ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-[#9b9b9b]" /></div>
          ) : entries.length === 0 ? (
            <EmptyState icon={CreditCard} message="Nog geen usage data" sub="Token gebruik wordt automatisch bijgehouden" />
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {stats.map(s => {
                  const Icon = s.icon;
                  return (
                    <SectionCard key={s.label} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-3.5 w-3.5 ${colors.textMuted}`} />
                        <span className={`text-[10px] ${colors.textMuted} uppercase tracking-wider`}>{s.label}</span>
                      </div>
                      <p className={`text-xl font-semibold ${colors.textTitle} font-mono`}>{s.value}</p>
                    </SectionCard>
                  );
                })}
              </div>

              {/* Per model */}
              {Object.keys(perModel).length > 0 && (
                <SectionCard className="mb-6">
                  <div className={`px-4 py-2.5 border-b ${colors.borderSubtle}`}>
                    <h2 className={`text-sm font-medium ${colors.textTitle}`}>Per model</h2>
                  </div>
                  <table className="w-full">
                    <thead><tr className={`border-b ${colors.borderSubtle}`}>
                      <Th>Model</Th><Th align="right">Input</Th><Th align="right">Output</Th><Th align="right">Requests</Th><Th align="right">Kosten</Th>
                    </tr></thead>
                    <tbody className={`${colors.divider}`}>
                      {Object.entries(perModel).map(([model, s]) => (
                        <Tr key={model}>
                          <Td mono>{model}</Td><Td align="right" mono>{fmtTokens(s.input)}</Td><Td align="right" mono>{fmtTokens(s.output)}</Td>
                          <Td align="right" mono>{s.requests}</Td><Td align="right" mono>{fmtKosten(s.kosten)}</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </table>
                </SectionCard>
              )}

              {/* Dagelijks */}
              {dagLijst.length > 0 && (
                <SectionCard>
                  <div className={`px-4 py-2.5 border-b ${colors.borderSubtle}`}>
                    <h2 className={`text-sm font-medium ${colors.textTitle}`}>Dagelijks overzicht</h2>
                  </div>
                  <table className="w-full">
                    <thead><tr className={`border-b ${colors.borderSubtle}`}>
                      <Th>Datum</Th><Th align="right">Input</Th><Th align="right">Output</Th><Th align="right">Requests</Th><Th align="right">Kosten</Th>
                    </tr></thead>
                    <tbody className={`${colors.divider}`}>
                      {dagLijst.map(([datum, s]) => (
                        <Tr key={datum}>
                          <Td>{fmtDatum(datum)}</Td><Td align="right" mono>{fmtTokens(s.input)}</Td><Td align="right" mono>{fmtTokens(s.output)}</Td>
                          <Td align="right" mono>{s.requests}</Td><Td align="right" mono>{fmtKosten(s.kosten)}</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </table>
                </SectionCard>
              )}
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
