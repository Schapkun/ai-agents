"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

type Taak = { tekst: string; klaar: boolean };
type Project = { naam: string; taken: Taak[] };
type LogboekEntry = { datum: string; inhoud: string; categorie: string };
type Idee = { titel: string; beschrijving: string; status: string; datum: string; url: string | null };
type ProjectInfo = { naam: string; beschrijving: string; status: string; openTaken?: number };

function formatDatum(datum: string): string {
  const d = new Date(datum + "T00:00:00");
  const dagen = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const maanden = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${dagen[d.getDay()]} ${d.getDate()} ${maanden[d.getMonth()]}`;
}

const PRIJZEN: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  "claude-haiku-3-5": { input: 0.8, output: 4 },
  "claude-opus-4-6": { input: 15, output: 75 },
};

function berekenKosten(model: string, it: number, ot: number): number {
  const key = Object.keys(PRIJZEN).find((k) => model.includes(k) || k.includes(model));
  const p = key ? PRIJZEN[key] : { input: 3, output: 15 };
  return (it / 1e6) * p.input + (ot / 1e6) * p.output;
}

function SectionLink({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
      Alles <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

export default function DashboardPage() {
  const [openTaken, setOpenTaken] = useState<{ tekst: string; project: string }[]>([]);
  const [totaalOpen, setTotaalOpen] = useState(0);
  const [totaalKlaar, setTotaalKlaar] = useState(0);
  const [ideeen, setIdeeen] = useState<Idee[]>([]);
  const [logboek, setLogboek] = useState<LogboekEntry[]>([]);
  const [projecten, setProjecten] = useState<ProjectInfo[]>([]);
  const [takenPerProject, setTakenPerProject] = useState<Record<string, number>>({});
  const [kostenMaand, setKostenMaand] = useState(0);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    let n = 0;
    const check = () => { n++; if (n >= 5) setLaden(false); };

    fetch("/api/taken").then(r => r.json()).then((d: { projects: Project[] }) => {
      const alle: { tekst: string; project: string }[] = [];
      const counts: Record<string, number> = {};
      let open = 0, klaar = 0;
      for (const p of d.projects ?? []) {
        counts[p.naam] = p.taken.filter(t => !t.klaar).length;
        open += p.taken.filter(t => !t.klaar).length;
        klaar += p.taken.filter(t => t.klaar).length;
        for (const t of p.taken.filter(t => !t.klaar)) alle.push({ tekst: t.tekst, project: p.naam });
      }
      setOpenTaken(alle.slice(0, 5));
      setTakenPerProject(counts);
      setTotaalOpen(open);
      setTotaalKlaar(klaar);
    }).catch(() => {}).finally(check);

    fetch("/api/ideeen").then(r => r.json()).then((d: { ideeen: Idee[] }) => setIdeeen((d.ideeen ?? []).slice(0, 3))).catch(() => {}).finally(check);
    fetch("/api/logboek").then(r => r.json()).then((d: LogboekEntry[]) => { if (Array.isArray(d)) setLogboek(d.slice(0, 4)); }).catch(() => {}).finally(check);
    fetch("/api/projecten").then(r => r.json()).then((d: { projecten: ProjectInfo[] }) => setProjecten(d.projecten ?? [])).catch(() => {}).finally(check);
    fetch("/api/usage").then(r => r.json()).then((d: { entries: { datum: string; model: string; input_tokens: number; output_tokens: number }[] }) => {
      const hm = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
      setKostenMaand((d.entries?.filter(e => e.datum.startsWith(hm)) ?? []).reduce((s, e) => s + berekenKosten(e.model, e.input_tokens, e.output_tokens), 0));
    }).catch(() => {}).finally(check);
  }, []);

  function getOpen(naam: string): number {
    const e = takenPerProject[naam];
    if (e !== undefined) return e;
    const k = Object.keys(takenPerProject).find(k => k.toLowerCase().includes(naam.toLowerCase()) || naam.toLowerCase().includes(k.toLowerCase()));
    return k ? takenPerProject[k] : 0;
  }

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>{totaalOpen} open</span>
              <span className="text-muted-foreground/40">|</span>
              <span>{totaalKlaar} afgerond</span>
              <span className="text-muted-foreground/40">|</span>
              <span>{projecten.length} projecten</span>
              <span className="text-muted-foreground/40">|</span>
              <span>${kostenMaand.toFixed(2)}</span>
            </div>
          </div>
          {laden ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 text-muted-foreground animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Openstaande taken</CardTitle>
                  <CardAction><SectionLink href="/taken" /></CardAction>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-border">
                    {openTaken.map((t, i) => (
                      <div key={i} className="py-2">
                        <p className="text-sm text-muted-foreground leading-snug">{t.tekst}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{t.project}</p>
                      </div>
                    ))}
                    {openTaken.length === 0 && <p className="py-3 text-sm text-muted-foreground/60">Geen taken</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ideeën</CardTitle>
                  <CardAction><SectionLink href="/ideeen" /></CardAction>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-border">
                    {ideeen.map((idee, i) => (
                      <div key={i} className="py-2 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{idee.titel}</p>
                        <span className="text-xs text-muted-foreground/60">{idee.status}</span>
                      </div>
                    ))}
                    {ideeen.length === 0 && <p className="py-3 text-sm text-muted-foreground/60">Geen ideeën</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Logboek</CardTitle>
                  <CardAction><SectionLink href="/logboek" /></CardAction>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-border">
                    {logboek.map((entry, i) => {
                      const r = entry.inhoud.split("\n").find((l: string) => l.trim() && !l.startsWith("#")) || entry.datum;
                      return (
                        <div key={i} className="py-2 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate flex-1 min-w-0">{r.replace(/^[-*]\s*/, "").trim()}</p>
                          <span className="text-xs text-muted-foreground/60 shrink-0 ml-3">{formatDatum(entry.datum)}</span>
                        </div>
                      );
                    })}
                    {logboek.length === 0 && <p className="py-3 text-sm text-muted-foreground/60">Geen entries</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Projecten</CardTitle>
                  <CardAction><SectionLink href="/projecten" /></CardAction>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-border">
                    {projecten.map((p, i) => (
                      <Link key={i} href={`/projecten/${encodeURIComponent(p.naam)}`} className="block">
                        <div className="py-2 flex items-center justify-between hover:bg-muted/50 transition-colors -mx-4 px-4">
                          <p className="text-sm text-muted-foreground">{p.naam}</p>
                          <span className="text-xs text-muted-foreground/60 font-mono">{getOpen(p.naam)} open</span>
                        </div>
                      </Link>
                    ))}
                    {projecten.length === 0 && <p className="py-3 text-sm text-muted-foreground/60">Geen projecten</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
