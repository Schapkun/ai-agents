"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Lightbulb, BookOpen, FolderOpen, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";

type Taak = { tekst: string; klaar: boolean };
type Project = { naam: string; taken: Taak[] };
type LogboekEntry = { datum: string; inhoud: string; categorie: string };
type Idee = { titel: string; beschrijving: string; status: string; datum: string; url: string | null };
type ProjectInfo = { naam: string; beschrijving: string; status: string };

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
  const [ideeen, setIdeeen] = useState<Idee[]>([]);
  const [logboek, setLogboek] = useState<LogboekEntry[]>([]);
  const [projecten, setProjecten] = useState<ProjectInfo[]>([]);
  const [kostenMaand, setKostenMaand] = useState<number>(0);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    let geladen = 0;
    const check = () => { geladen++; if (geladen >= 5) setLaden(false); };

    fetch("/api/taken")
      .then((r) => r.json())
      .then((data: { projects: Project[] }) => {
        const alle: { tekst: string; project: string }[] = [];
        for (const p of data.projects ?? []) {
          for (const t of p.taken.filter((t) => !t.klaar)) {
            alle.push({ tekst: t.tekst, project: p.naam });
          }
        }
        setOpenTaken(alle.slice(0, 4));
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
        if (Array.isArray(data)) setLogboek(data.slice(0, 3));
      })
      .catch(() => {})
      .finally(check);

    fetch("/api/projecten")
      .then((r) => r.json())
      .then((data: { projecten: ProjectInfo[] }) => setProjecten((data.projecten ?? []).slice(0, 4)))
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

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
            <span className="text-sm text-[#9b9b9b] font-mono">${kostenMaand.toFixed(2)} deze maand</span>
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Openstaande taken */}
              <div className="bg-[#2f2f2f] rounded-xl border border-[#383838] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#383838]">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-[#9b9b9b]" />
                    <h2 className="text-sm font-medium text-white">Openstaande taken</h2>
                  </div>
                  <Link href="/taken" className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-white transition-colors">
                    Bekijk alles <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                {openTaken.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-[#9b9b9b]">Geen openstaande taken</p>
                ) : (
                  <div className="divide-y divide-[#383838]/50">
                    {openTaken.map((t, i) => (
                      <div key={i} className="px-5 py-3 hover:bg-[#383838]/30 transition-colors">
                        <p className="text-sm text-[#ececec]">{t.tekst}</p>
                        <p className="text-xs text-[#9b9b9b] mt-0.5">{t.project}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recente ideeen */}
              <div className="bg-[#2f2f2f] rounded-xl border border-[#383838] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#383838]">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[#9b9b9b]" />
                    <h2 className="text-sm font-medium text-white">Recente idee\u00ebn</h2>
                  </div>
                  <Link href="/ideeen" className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-white transition-colors">
                    Bekijk alles <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                {ideeen.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-[#9b9b9b]">Geen idee\u00ebn</p>
                ) : (
                  <div className="divide-y divide-[#383838]/50">
                    {ideeen.map((idee, i) => (
                      <div key={i} className="px-5 py-3 hover:bg-[#383838]/30 transition-colors">
                        <p className="text-sm text-[#ececec]">{idee.titel}</p>
                        <p className="text-xs text-[#9b9b9b] mt-0.5">{idee.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Logboek */}
              <div className="bg-[#2f2f2f] rounded-xl border border-[#383838] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#383838]">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#9b9b9b]" />
                    <h2 className="text-sm font-medium text-white">Logboek</h2>
                  </div>
                  <Link href="/logboek" className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-white transition-colors">
                    Bekijk alles <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                {logboek.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-[#9b9b9b]">Geen logboek entries</p>
                ) : (
                  <div className="divide-y divide-[#383838]/50">
                    {logboek.map((entry, i) => {
                      const eersteRegel = entry.inhoud.split("\n").find((r: string) => r.trim() && !r.startsWith("#")) || entry.datum;
                      return (
                        <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-[#383838]/30 transition-colors">
                          <p className="text-sm text-[#ececec] truncate flex-1 min-w-0">{eersteRegel.replace(/^[-*]\s*/, "").trim()}</p>
                          <span className="text-xs text-[#9b9b9b] shrink-0 ml-3">{formatDatum(entry.datum)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Projecten */}
              <div className="bg-[#2f2f2f] rounded-xl border border-[#383838] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#383838]">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-[#9b9b9b]" />
                    <h2 className="text-sm font-medium text-white">Projecten</h2>
                  </div>
                  <Link href="/projecten" className="flex items-center gap-1 text-xs text-[#9b9b9b] hover:text-white transition-colors">
                    Bekijk alles <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                {projecten.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-[#9b9b9b]">Geen projecten</p>
                ) : (
                  <div className="divide-y divide-[#383838]/50">
                    {projecten.map((p, i) => (
                      <div key={i} className="px-5 py-3 hover:bg-[#383838]/30 transition-colors">
                        <p className="text-sm text-[#ececec]">{p.naam}</p>
                        <p className="text-xs text-[#9b9b9b] mt-0.5">{p.beschrijving || p.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
