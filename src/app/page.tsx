"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";

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

function berekenKosten(model: string, inputTokens: number, outputTokens: number): number {
  const key = Object.keys(PRIJZEN).find((k) => model.includes(k) || k.includes(model));
  const prijs = key ? PRIJZEN[key] : { input: 3, output: 15 };
  return (inputTokens / 1_000_000) * prijs.input + (outputTokens / 1_000_000) * prijs.output;
}

export default function DashboardPage() {
  const [openTaken, setOpenTaken] = useState<{ tekst: string; project: string }[]>([]);
  const [totaalOpen, setTotaalOpen] = useState(0);
  const [totaalKlaar, setTotaalKlaar] = useState(0);
  const [ideeen, setIdeeen] = useState<Idee[]>([]);
  const [logboek, setLogboek] = useState<LogboekEntry[]>([]);
  const [projecten, setProjecten] = useState<ProjectInfo[]>([]);
  const [takenPerProject, setTakenPerProject] = useState<Record<string, number>>({});
  const [kostenMaand, setKostenMaand] = useState<number>(0);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    let geladen = 0;
    const check = () => { geladen++; if (geladen >= 5) setLaden(false); };

    fetch("/api/taken")
      .then((r) => r.json())
      .then((data: { projects: Project[] }) => {
        const alle: { tekst: string; project: string }[] = [];
        const counts: Record<string, number> = {};
        let open = 0, klaar = 0;
        for (const p of data.projects ?? []) {
          counts[p.naam] = p.taken.filter((t) => !t.klaar).length;
          open += p.taken.filter((t) => !t.klaar).length;
          klaar += p.taken.filter((t) => t.klaar).length;
          for (const t of p.taken.filter((t) => !t.klaar)) {
            alle.push({ tekst: t.tekst, project: p.naam });
          }
        }
        setOpenTaken(alle.slice(0, 5));
        setTakenPerProject(counts);
        setTotaalOpen(open);
        setTotaalKlaar(klaar);
      })
      .catch(() => {}).finally(check);

    fetch("/api/ideeen").then((r) => r.json())
      .then((data: { ideeen: Idee[] }) => setIdeeen((data.ideeen ?? []).slice(0, 3)))
      .catch(() => {}).finally(check);

    fetch("/api/logboek").then((r) => r.json())
      .then((data: LogboekEntry[]) => { if (Array.isArray(data)) setLogboek(data.slice(0, 4)); })
      .catch(() => {}).finally(check);

    fetch("/api/projecten").then((r) => r.json())
      .then((data: { projecten: ProjectInfo[] }) => setProjecten(data.projecten ?? []))
      .catch(() => {}).finally(check);

    fetch("/api/usage").then((r) => r.json())
      .then((data: { entries: { datum: string; model: string; input_tokens: number; output_tokens: number }[] }) => {
        const nu = new Date();
        const hm = `${nu.getFullYear()}-${String(nu.getMonth() + 1).padStart(2, "0")}`;
        const me = data.entries?.filter((e) => e.datum.startsWith(hm)) ?? [];
        setKostenMaand(me.reduce((s, e) => s + berekenKosten(e.model, e.input_tokens, e.output_tokens), 0));
      })
      .catch(() => {}).finally(check);
  }, []);

  function getOpenTaken(naam: string): number {
    const exact = takenPerProject[naam];
    if (exact !== undefined) return exact;
    const key = Object.keys(takenPerProject).find(
      (k) => k.toLowerCase().includes(naam.toLowerCase()) || naam.toLowerCase().includes(k.toLowerCase())
    );
    return key ? takenPerProject[key] : 0;
  }

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-6 py-6">
          {/* Header met inline metrics */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
            <div className="flex items-center gap-4 text-xs font-mono text-[#9b9b9b]">
              <span>{totaalOpen} open</span>
              <span className="text-white/[0.1]">|</span>
              <span>{totaalKlaar} afgerond</span>
              <span className="text-white/[0.1]">|</span>
              <span>{projecten.length} projecten</span>
              <span className="text-white/[0.1]">|</span>
              <span>${kostenMaand.toFixed(2)}</span>
            </div>
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Openstaande taken */}
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <h2 className="text-sm font-medium text-white">Openstaande taken</h2>
                  <Link href="/taken" className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-white transition-colors">
                    Alles <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {openTaken.map((t, i) => (
                    <div key={i} className="px-4 py-2 hover:bg-white/[0.02] transition-colors">
                      <p className="text-sm text-[#9b9b9b] leading-snug">{t.tekst}</p>
                      <p className="text-[10px] text-[#666] mt-0.5">{t.project}</p>
                    </div>
                  ))}
                  {openTaken.length === 0 && <p className="px-4 py-3 text-sm text-[#666]">Geen taken</p>}
                </div>
              </div>

              {/* Recente ideeën */}
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <h2 className="text-sm font-medium text-white">Idee{"ë"}n</h2>
                  <Link href="/ideeen" className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-white transition-colors">
                    Alles <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {ideeen.map((idee, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2 hover:bg-white/[0.02] transition-colors">
                      <p className="text-sm text-[#9b9b9b]">{idee.titel}</p>
                      <span className="text-[10px] text-[#666]">{idee.status}</span>
                    </div>
                  ))}
                  {ideeen.length === 0 && <p className="px-4 py-3 text-sm text-[#666]">Geen idee{"ë"}n</p>}
                </div>
              </div>

              {/* Logboek */}
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <h2 className="text-sm font-medium text-white">Logboek</h2>
                  <Link href="/logboek" className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-white transition-colors">
                    Alles <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {logboek.map((entry, i) => {
                    const regel = entry.inhoud.split("\n").find((r: string) => r.trim() && !r.startsWith("#")) || entry.datum;
                    return (
                      <div key={i} className="flex items-center justify-between px-4 py-2 hover:bg-white/[0.02] transition-colors">
                        <p className="text-sm text-[#9b9b9b] truncate flex-1 min-w-0">{regel.replace(/^[-*]\s*/, "").trim()}</p>
                        <span className="text-[10px] text-[#666] shrink-0 ml-3">{formatDatum(entry.datum)}</span>
                      </div>
                    );
                  })}
                  {logboek.length === 0 && <p className="px-4 py-3 text-sm text-[#666]">Geen entries</p>}
                </div>
              </div>

              {/* Projecten */}
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <h2 className="text-sm font-medium text-white">Projecten</h2>
                  <Link href="/projecten" className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-white transition-colors">
                    Alles <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {projecten.map((p, i) => (
                    <Link key={i} href={`/projecten/${encodeURIComponent(p.naam)}`} className="flex items-center justify-between px-4 py-2 hover:bg-white/[0.02] transition-colors block">
                      <p className="text-sm text-[#9b9b9b]">{p.naam}</p>
                      <span className="text-[10px] text-[#666] font-mono">{getOpenTaken(p.naam)} open</span>
                    </Link>
                  ))}
                  {projecten.length === 0 && <p className="px-4 py-3 text-sm text-[#666]">Geen projecten</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
