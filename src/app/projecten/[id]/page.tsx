"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Loader2, CheckSquare } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";

type Taak = { tekst: string; klaar: boolean };
type LogboekEntry = { datum: string; inhoud: string };

type ProjectDetail = {
  naam: string;
  beschrijving: string;
  inhoud: string;
  devServer: string | null;
  liveUrl: string | null;
  liveDomein: string | null;
  github: string | null;
  taken: Taak[];
  logboek: LogboekEntry[];
};

function formatDatum(datum: string): string {
  const d = new Date(datum + "T00:00:00");
  const dagen = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const maanden = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${dagen[d.getDay()]} ${d.getDate()} ${maanden[d.getMonth()]}`;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    fetch(`/api/projecten/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d: ProjectDetail) => {
        setData(d);
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, [id]);

  const openTaken = data?.taken.filter((t) => !t.klaar) ?? [];
  const klaarTaken = data?.taken.filter((t) => t.klaar) ?? [];

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-8 py-8">
          {/* Back link */}
          <Link
            href="/projecten"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-muted-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar projecten
          </Link>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            </div>
          ) : !data ? (
            <p className="text-sm text-muted-foreground">Project niet gevonden</p>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-white">{data.naam}</h1>
                {data.beschrijving && (
                  <p className="text-sm text-muted-foreground mt-1">{data.beschrijving}</p>
                )}
              </div>

              {/* Links */}
              {(data.devServer || data.liveUrl || data.github) && (
                <div className="flex gap-3 mb-8">
                  {data.devServer && (
                    <a
                      href={data.devServer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      Dev server <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {data.liveUrl && (
                    <a
                      href={data.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      {data.liveDomein || "Live"} <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {data.github && (
                    <a
                      href={data.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      GitHub <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                {/* Open taken */}
                <div className="bg-card backdrop-blur-sm rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                    <h2 className="text-sm font-medium text-foreground">Openstaande taken</h2>
                    <span className="text-xs text-muted-foreground font-mono">{openTaken.length}</span>
                  </div>
                  {openTaken.length === 0 ? (
                    <div className="flex flex-col items-center py-8">
                      <CheckSquare className="h-5 w-5 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Geen openstaande taken</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.05]">
                      {openTaken.map((t, i) => (
                        <div key={i} className="px-5 py-2.5 hover:bg-accent/50 transition-colors">
                          <p className="text-sm text-foreground">{t.tekst}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Afgeronde taken */}
                <div className="bg-card backdrop-blur-sm rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                    <h2 className="text-sm font-medium text-foreground">Afgeronde taken</h2>
                    <span className="text-xs text-muted-foreground font-mono">{klaarTaken.length}</span>
                  </div>
                  {klaarTaken.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-muted-foreground">Geen afgeronde taken</p>
                  ) : (
                    <div className="divide-y divide-white/[0.05]">
                      {klaarTaken.map((t, i) => (
                        <div key={i} className="px-5 py-2.5 hover:bg-accent/50 transition-colors">
                          <p className="text-sm text-muted-foreground line-through">{t.tekst}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Logboek */}
                {data.logboek.length > 0 && (
                  <div className="col-span-2 bg-card backdrop-blur-sm rounded-xl border border-border overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.06]">
                      <h2 className="text-sm font-medium text-foreground">Recente logboek entries</h2>
                    </div>
                    <div className="divide-y divide-white/[0.05]">
                      {data.logboek.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-2.5 hover:bg-accent/50 transition-colors">
                          <p className="text-sm text-foreground truncate flex-1 min-w-0">{entry.inhoud}</p>
                          <span className="text-xs text-muted-foreground shrink-0 ml-3">{formatDatum(entry.datum)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
