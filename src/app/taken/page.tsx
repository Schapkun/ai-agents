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
  const [activeTab, setActiveTab] = useState<"open" | "klaar">("open");

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

  const alleTaken: { tekst: string; project: string; klaar: boolean }[] = [];
  for (const p of projects) {
    for (const t of p.taken) {
      alleTaken.push({ tekst: t.tekst, project: p.naam, klaar: t.klaar });
    }
  }

  const openTaken = alleTaken.filter((t) => !t.klaar);
  const klaarTaken = alleTaken.filter((t) => t.klaar);
  const getoondeTaken = activeTab === "open" ? openTaken : klaarTaken;

  // Tellers voor uitgevoerd tab
  const goedgekeurd = 0; // Kan later dynamisch worden
  const teBeoordelen = klaarTaken.length;

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Taken</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#171717] rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab("open")}
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                activeTab === "open"
                  ? "bg-[#2f2f2f] text-white font-medium"
                  : "text-[#9b9b9b] hover:text-white"
              }`}
            >
              Openstaand ({openTaken.length})
            </button>
            <button
              onClick={() => setActiveTab("klaar")}
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                activeTab === "klaar"
                  ? "bg-[#2f2f2f] text-white font-medium"
                  : "text-[#9b9b9b] hover:text-white"
              }`}
            >
              Uitgevoerd ({klaarTaken.length})
            </button>
          </div>

          {/* Teller voor uitgevoerd tab */}
          {activeTab === "klaar" && klaarTaken.length > 0 && (
            <p className="text-xs text-[#9b9b9b] mb-4">
              {goedgekeurd} goedgekeurd &middot; {teBeoordelen} te beoordelen
            </p>
          )}

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : getoondeTaken.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 mb-3">
                <CheckSquare className="h-5 w-5 text-[#9b9b9b]" />
              </div>
              <p className="text-sm text-[#9b9b9b]">
                {activeTab === "open" ? "Geen openstaande taken" : "Geen uitgevoerde taken"}
              </p>
            </div>
          ) : (
            <div className="bg-[#2f2f2f] rounded-xl border border-[#383838] overflow-hidden">
              <div className="divide-y divide-[#383838]/50">
                {getoondeTaken.map((taak, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#383838]/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${taak.klaar ? "text-[#9b9b9b] line-through" : "text-[#ececec]"}`}>
                        {taak.tekst}
                      </p>
                      <p className="text-xs text-[#9b9b9b] mt-0.5">{taak.project}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {activeTab === "open" ? (
                        <>
                          <button className="px-3 py-1.5 text-xs rounded-lg text-[#9b9b9b] hover:text-white hover:bg-[#383838] transition-colors">
                            Uitvoeren
                          </button>
                          <button className="px-3 py-1.5 text-xs rounded-lg text-[#9b9b9b] hover:text-white hover:bg-[#383838] transition-colors">
                            Bewerken
                          </button>
                          <button className="px-3 py-1.5 text-xs rounded-lg text-[#9b9b9b] hover:text-white hover:bg-[#383838] transition-colors">
                            Annuleren
                          </button>
                        </>
                      ) : (
                        <button className="px-3 py-1.5 text-xs rounded-lg text-[#9b9b9b] hover:text-white hover:bg-[#383838] transition-colors">
                          Wijziging
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
