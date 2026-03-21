"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader, SectionCard, SectionHeader, ListItem, InlineStats } from "@/components/ui/design";

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
          <PageHeader
            title="Dashboard"
            right={<InlineStats items={[
              { label: "open", value: totaalOpen },
              { label: "afgerond", value: totaalKlaar },
              { label: "projecten", value: projecten.length },
              { label: "", value: "$" + kostenMaand.toFixed(2) },
            ]} />}
          />
          {laden ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <SectionCard>
                <SectionHeader title="Openstaande taken" href="/taken" />
                <div className="divide-y divide-white/[0.05]">
                  {openTaken.map((t, i) => (
                    <ListItem key={i}>
                      <p className="text-sm text-[#9b9b9b] leading-snug">{t.tekst}</p>
                      <p className="text-[10px] text-[#666] mt-0.5">{t.project}</p>
                    </ListItem>
                  ))}
                  {openTaken.length === 0 && <p className="px-4 py-3 text-sm text-[#666]">Geen taken</p>}
                </div>
              </SectionCard>

              <SectionCard>
                <SectionHeader title={"Idee\u00EBn"} href="/ideeen" />
                <div className="divide-y divide-white/[0.05]">
                  {ideeen.map((idee, i) => (
                    <ListItem key={i} className="flex items-center justify-between">
                      <p className="text-sm text-[#9b9b9b]">{idee.titel}</p>
                      <span className="text-[10px] text-[#666]">{idee.status}</span>
                    </ListItem>
                  ))}
                  {ideeen.length === 0 && <p className="px-4 py-3 text-sm text-[#666]">Geen idee\u00EBn</p>}
                </div>
              </SectionCard>

              <SectionCard>
                <SectionHeader title="Logboek" href="/logboek" />
                <div className="divide-y divide-white/[0.05]">
                  {logboek.map((entry, i) => {
                    const r = entry.inhoud.split("\n").find((l: string) => l.trim() && !l.startsWith("#")) || entry.datum;
                    return (
                      <ListItem key={i} className="flex items-center justify-between">
                        <p className="text-sm text-[#9b9b9b] truncate flex-1 min-w-0">{r.replace(/^[-*]\s*/, "").trim()}</p>
                        <span className="text-[10px] text-[#666] shrink-0 ml-3">{formatDatum(entry.datum)}</span>
                      </ListItem>
                    );
                  })}
                  {logboek.length === 0 && <p className="px-4 py-3 text-sm text-[#666]">Geen entries</p>}
                </div>
              </SectionCard>

              <SectionCard>
                <SectionHeader title="Projecten" href="/projecten" />
                <div className="divide-y divide-white/[0.05]">
                  {projecten.map((p, i) => (
                    <Link key={i} href={`/projecten/${encodeURIComponent(p.naam)}`} className="block">
                      <ListItem className="flex items-center justify-between">
                        <p className="text-sm text-[#9b9b9b]">{p.naam}</p>
                        <span className="text-[10px] text-[#666] font-mono">{getOpen(p.naam)} open</span>
                      </ListItem>
                    </Link>
                  ))}
                  {projecten.length === 0 && <p className="px-4 py-3 text-sm text-[#666]">Geen projecten</p>}
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
