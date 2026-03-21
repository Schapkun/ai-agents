"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type Taak = {
  tekst: string;
  klaar: boolean;
};

type Project = {
  naam: string;
  taken: Taak[];
};

type TakenData = {
  projects: Project[];
};

export default function TakenPage() {
  const [data, setData] = useState<TakenData | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    fetch("/api/taken")
      .then((r) => r.json())
      .then((d: TakenData) => {
        setData(d);
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, []);

  const projects = data?.projects ?? [];
  const totaalOpen = projects.reduce((s, p) => s + p.taken.filter((t) => !t.klaar).length, 0);
  const totaalKlaar = projects.reduce((s, p) => s + p.taken.filter((t) => t.klaar).length, 0);

  const takenHeader = (
    <div>
      <h1 className="text-base font-semibold tracking-tight">Taken</h1>
      <p className="text-[10px] text-[#acacbe]">
        {totaalOpen} open \u00b7 {totaalKlaar} afgerond
      </p>
    </div>
  );

  return (
    <DashboardLayout header={takenHeader}>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#acacbe] animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 mb-3">
                <CheckSquare className="h-5 w-5 text-[#acacbe]" />
              </div>
              <p className="text-sm text-[#acacbe]">Geen taken gevonden</p>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project) => {
                const open = project.taken.filter((t) => !t.klaar).length;
                const klaar = project.taken.filter((t) => t.klaar).length;
                return (
                  <div key={project.naam} className="bg-[#40414f] rounded-2xl border border-[#4d4d4f] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#4d4d4f]">
                      <h3 className="text-sm font-medium text-white">{project.naam}</h3>
                      <span className="text-xs text-[#acacbe]">{open} open \u00b7 {klaar} klaar</span>
                    </div>
                    <div className="divide-y divide-[#4d4d4f]/50">
                      {project.taken.map((taak, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[#4d4d4f]/30 transition-colors">
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            taak.klaar
                              ? "bg-white border-white"
                              : "border-[#acacbe]/40"
                          }`}>
                            {taak.klaar && (
                              <svg className="h-3 w-3 text-[#202123]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${taak.klaar ? "text-[#acacbe] line-through" : "text-white"}`}>
                            {taak.tekst}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
