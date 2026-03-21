"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, CheckSquare, CheckCircle2, FolderOpen, CreditCard } from "lucide-react";
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
        let open = 0;
        let klaar = 0;
        for (const p of data.projects ?? []) {
          const openCount = p.taken.filter((t) => !t.klaar).length;
          const klaarCount = p.taken.filter((t) => t.klaar).length;
          counts[p.naam] = openCount;
          open += openCount;
          klaar += klaarCount;
          for (const t of p.taken.filter((t) => !t.klaar)) {
            alle.push({ tekst: t.tekst, project: p.naam });
          }
        }
        setOpenTaken(alle.slice(0, 5));
        setTakenPerProject(counts);
        setTotaalOpen(open);
        setTotaalKlaar(klaar);
      })
      .catch(() => {})
      .finally(check);

    fetch("/api/ideeen")
      .then((r) => r.json())
      .then((data: { ideeen: Idee[] }) => setIdeeen((data.ideeen ?? []).slice(0, 3)))
      .catch(() => {})
      .finally(check);

    fetch("/api/logboek")
      .then((r) => r.json())
      .then((data: LogboekEntry[]) => {
        if (Array.isArray(data)) setLogboek(data.slice(0, 4));
      })
      .catch(() => {})
      .finally(check);

    fetch("/api/projecten")
      .then((r) => r.json())
      .then((data: { projecten: ProjectInfo[] }) => setProjecten(data.projecten ?? []))
      .catch(() => {})
      .finally(check);

    fetch("/api/usage")
      .then((r) => r.json())
      .then((data: { entries: { datum: string; model: string; input_tokens: number; output_tokens: number; requests: number }[] }) => {
        const nu = new Date();
        const huidigeMaand = `${nu.getFullYear()}-${String(nu.getMonth() + 1).padStart(2, "0")}`;
        const maandEntries = data.entries?.filter((e: { datum: string }) => e.datum.startsWith(huidigeMaand)) ?? [];
        const kosten = maandEntries.reduce(
          (s: number, e: { model: string; input_tokens: number; output_tokens: number }) => s + berekenKosten(e.model, e.input_tokens, e.output_tokens),
          0
        );
        setKostenMaand(kosten);
      })
      .catch(() => {})
      .finally(check);
  }, []);

  function getOpenTaken(projectNaam: string): number {
    const exact = takenPerProject[projectNaam];
    if (exact !== undefined) return exact;
    const key = Object.keys(takenPerProject).find(
      (k) => k.toLowerCase().includes(projectNaam.toLowerCase()) ||
             projectNaam.toLowerCase().includes(k.toLowerCase())
    );
    return key ? takenPerProject[key] : 0;
  }

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/[0.08] px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                      <CheckSquare className="h-4 w-4 text-[#9b9b9b]" />
                    </div>
                    <span className="text-xs text-[#666] uppercase tracking-wider">Openstaand</span>
                  </div>
                  <p className="text-3xl font-semibold text-white font-mono">{totaalOpen}</p>
                </div>

                <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/[0.08] px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                      <CheckCircle2 className="h-4 w-4 text-[#9b9b9b]" />
                    </div>
                    <span className="text-xs text-[#666] uppercase tracking-wider">Afgerond</span>
                  </div>
                  <p className="text-3xl font-semibold text-white font-mono">{totaalKlaar}</p>
                </div>

                <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/[0.08] px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                      <FolderOpen className="h-4 w-4 text-[#9b9b9b]" />
                    </div>
                    <span className="text-xs text-[#666] uppercase tracking-wider">Projecten</span>
                  </div>
                  <p className="text-3xl font-semibold text-white font-mono">{projecten.length}</p>
                </div>

                <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/[0.08] px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                      <CreditCard className="h-4 w-4 text-[#9b9b9b]" />
                    </div>
                    <span className="text-xs text-[#666] uppercase tracking-wider">Kosten</span>
                  </div>
                  <p className="text-3xl font-semibold text-white font-mono">${kostenMaand.toFixed(2)}</p>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-2 gap-5">
                {/* Openstaande taken */}
                <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                    <h2 className="text-sm font-medium text-[#ececec]">Openstaande taken</h2>
                    <Link href="/taken" className="flex items-center gap-1 text-xs text-[#666] hover:text-[#999] transition-colors">
                      Bekijk alles <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  {openTaken.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-[#666]">Geen openstaande taken</p>
                  ) : (
                    <div className="divide-y divide-white/[0.05]">
                      {openTaken.map((t, i) => (
                        <div key={i} className="px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
                          <p className="text-sm text-[#ececec]">{t.tekst}</p>
                          <p className="text-[10px] text-[#666] mt-0.5">{t.project}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recente ideeën */}
                <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                    <h2 className="text-sm font-medium text-[#ececec]">Recente ideeën</h2>
                    <Link href="/ideeen" className="flex items-center gap-1 text-xs text-[#666] hover:text-[#999] transition-colors">
                      Bekijk alles <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  {ideeen.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-[#666]">Geen ideeën</p>
                  ) : (
                    <div className="divide-y divide-white/[0.05]">
                      {ideeen.map((idee, i) => (
                        <div key={i} className="px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-[#ececec]">{idee.titel}</p>
                            <span className="text-[10px] text-[#666]">{idee.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Logboek */}
                <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                    <h2 className="text-sm font-medium text-[#ececec]">Logboek</h2>
                    <Link href="/logboek" className="flex items-center gap-1 text-xs text-[#666] hover:text-[#999] transition-colors">
                      Bekijk alles <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  {logboek.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-[#666]">Geen logboek entries</p>
                  ) : (
                    <div className="divide-y divide-white/[0.05]">
                      {logboek.map((entry, i) => {
                        const eersteRegel = entry.inhoud.split("\n").find((r: string) => r.trim() && !r.startsWith("#")) || entry.datum;
                        return (
                          <div key={i} className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
                            <p className="text-sm text-[#ececec] truncate flex-1 min-w-0">{eersteRegel.replace(/^[-*]\s*/, "").trim()}</p>
                            <span className="text-xs text-[#666] shrink-0 ml-3">{formatDatum(entry.datum)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Projecten */}
                <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                    <h2 className="text-sm font-medium text-[#ececec]">Projecten</h2>
                    <Link href="/projecten" className="flex items-center gap-1 text-xs text-[#666] hover:text-[#999] transition-colors">
                      Bekijk alles <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  {projecten.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-[#666]">Geen projecten</p>
                  ) : (
                    <div className="divide-y divide-white/[0.05]">
                      {projecten.map((p, i) => {
                        const open = getOpenTaken(p.naam);
                        return (
                          <Link key={i} href={`/projecten/${encodeURIComponent(p.naam)}`} className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.02] transition-colors block">
                            <p className="text-sm text-[#ececec]">{p.naam}</p>
                            <span className="text-xs text-[#666] font-mono">{open} open</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
