"use client";

import { useEffect, useState } from "react";
import { CreditCard, Coins, ArrowUpRight, ArrowDownRight, Hash, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

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
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Usage</h1>
            <p className="text-sm text-muted-foreground mt-1">API gebruik & geschatte kosten</p>
          </div>
          {laden ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent mb-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nog geen usage data</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Token gebruik wordt automatisch bijgehouden</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {stats.map(s => {
                  const Icon = s.icon;
                  return (
                    <Card key={s.label}>
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
                        </div>
                        <p className="text-xl font-semibold text-foreground font-mono">{s.value}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Per model */}
              {Object.keys(perModel).length > 0 && (
                <Card className="mb-6">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-sm">Per model</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Model</TableHead>
                          <TableHead className="text-right">Input</TableHead>
                          <TableHead className="text-right">Output</TableHead>
                          <TableHead className="text-right">Requests</TableHead>
                          <TableHead className="text-right">Kosten</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(perModel).map(([model, s]) => (
                          <TableRow key={model}>
                            <TableCell className="font-mono">{model}</TableCell>
                            <TableCell className="text-right font-mono">{fmtTokens(s.input)}</TableCell>
                            <TableCell className="text-right font-mono">{fmtTokens(s.output)}</TableCell>
                            <TableCell className="text-right font-mono">{s.requests}</TableCell>
                            <TableCell className="text-right font-mono">{fmtKosten(s.kosten)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Dagelijks */}
              {dagLijst.length > 0 && (
                <Card>
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-sm">Dagelijks overzicht</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Datum</TableHead>
                          <TableHead className="text-right">Input</TableHead>
                          <TableHead className="text-right">Output</TableHead>
                          <TableHead className="text-right">Requests</TableHead>
                          <TableHead className="text-right">Kosten</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dagLijst.map(([datum, s]) => (
                          <TableRow key={datum}>
                            <TableCell>{fmtDatum(datum)}</TableCell>
                            <TableCell className="text-right font-mono">{fmtTokens(s.input)}</TableCell>
                            <TableCell className="text-right font-mono">{fmtTokens(s.output)}</TableCell>
                            <TableCell className="text-right font-mono">{s.requests}</TableCell>
                            <TableCell className="text-right font-mono">{fmtKosten(s.kosten)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
