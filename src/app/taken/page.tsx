"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { CheckSquare, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader, SectionCard, Tabs, ActionButton, EmptyState, colors } from "@/components/ui/design";

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

type TaakItem = { tekst: string; project: string; klaar: boolean };

export default function TakenPage() {
  const [data, setData] = useState<TakenData | null>(null);
  const [laden, setLaden] = useState(true);
  const [activeTab, setActiveTab] = useState<"open" | "klaar">("open");
  const [bewerkIndex, setBewerkIndex] = useState<number | null>(null);
  const [bewerkTekst, setBewerkTekst] = useState("");
  const [bevestigIndex, setBevestigIndex] = useState<number | null>(null);
  const [bezig, setBezig] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTaken = useCallback(() => {
    fetch("/api/taken")
      .then((r) => r.json())
      .then((d: TakenData) => {
        setData(d);
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, []);

  useEffect(() => {
    fetchTaken();
  }, [fetchTaken]);

  useEffect(() => {
    if (bewerkIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [bewerkIndex]);

  const projects = data?.projects ?? [];
  const alleTaken: TaakItem[] = [];
  for (const p of projects) {
    for (const t of p.taken) {
      alleTaken.push({ tekst: t.tekst, project: p.naam, klaar: t.klaar });
    }
  }

  const openTaken = alleTaken.filter((t) => !t.klaar);
  const klaarTaken = alleTaken.filter((t) => t.klaar);
  const getoondeTaken = activeTab === "open" ? openTaken : klaarTaken;

  async function handleActie(taak: TaakItem, actie: string, nieuweTekst?: string) {
    const idx = getoondeTaken.indexOf(taak);
    setBezig(idx);
    try {
      const res = await fetch("/api/taken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: taak.project, taak: taak.tekst, actie, nieuweTekst }),
      });
      if (res.ok) {
        fetchTaken();
      }
    } catch {
      // stil falen
    } finally {
      setBezig(null);
      setBewerkIndex(null);
      setBevestigIndex(null);
    }
  }

  function startBewerken(index: number, tekst: string) {
    setBewerkIndex(index);
    setBewerkTekst(tekst);
  }

  function submitBewerking(taak: TaakItem) {
    if (bewerkTekst.trim() && bewerkTekst.trim() !== taak.tekst) {
      handleActie(taak, "bewerken", bewerkTekst.trim());
    } else {
      setBewerkIndex(null);
    }
  }

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-2xl font-semibold tracking-tight ${colors.textTitle}`}>Taken</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white/[0.03] rounded-lg p-1 w-fit border border-white/[0.05]">
            <button
              onClick={() => setActiveTab("open")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === "open"
                  ? "bg-white/[0.08] text-white font-medium"
                  : "text-[#666] hover:text-[#999]"
              }`}
            >
              Openstaand ({openTaken.length})
            </button>
            <button
              onClick={() => setActiveTab("klaar")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === "klaar"
                  ? "bg-white/[0.08] text-white font-medium"
                  : "text-[#666] hover:text-[#999]"
              }`}
            >
              Uitgevoerd ({klaarTaken.length})
            </button>
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : getoondeTaken.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] mb-3">
                <CheckSquare className="h-5 w-5 text-[#666]" />
              </div>
              <p className="text-sm text-[#666]">
                {activeTab === "open" ? "Geen openstaande taken" : "Geen uitgevoerde taken"}
              </p>
            </div>
          ) : (
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="divide-y divide-white/[0.05]">
                {getoondeTaken.map((taak, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.03] transition-colors">
                    <div className="flex-1 min-w-0">
                      {bewerkIndex === i ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={bewerkTekst}
                          onChange={(e) => setBewerkTekst(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") submitBewerking(taak);
                            if (e.key === "Escape") setBewerkIndex(null);
                          }}
                          onBlur={() => submitBewerking(taak)}
                          className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-[#9b9b9b] outline-none focus:border-white/[0.2]"
                        />
                      ) : (
                        <>
                          <p className={`text-sm ${taak.klaar ? "text-[#666] line-through" : "text-[#9b9b9b]"}`}>
                            {taak.tekst}
                          </p>
                          <p className="text-[10px] text-[#666] mt-0.5">{taak.project}</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {bezig === i ? (
                        <Loader2 className="h-4 w-4 text-[#666] animate-spin" />
                      ) : bevestigIndex === i ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#9b9b9b]">Zeker weten?</span>
                          <button
                            onClick={() => handleActie(taak, "annuleren")}
                            className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            Ja
                          </button>
                          <button
                            onClick={() => setBevestigIndex(null)}
                            className="px-3 py-1.5 text-xs rounded-lg text-[#9b9b9b] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                          >
                            Nee
                          </button>
                        </div>
                      ) : activeTab === "open" ? (
                        <>
                          <button
                            onClick={() => handleActie(taak, "uitvoeren")}
                            className="px-3 py-1.5 text-xs rounded-lg text-[#9b9b9b] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                          >
                            Uitvoeren
                          </button>
                          <button
                            onClick={() => startBewerken(i, taak.tekst)}
                            className="px-3 py-1.5 text-xs rounded-lg text-[#9b9b9b] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                          >
                            Bewerken
                          </button>
                          <button
                            onClick={() => setBevestigIndex(i)}
                            className="px-3 py-1.5 text-xs rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                          >
                            Annuleren
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleActie(taak, "heropenen")}
                            className="px-3 py-1.5 text-xs rounded-lg text-[#9b9b9b] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                          >
                            Heropenen
                          </button>
                          <button
                            onClick={() => startBewerken(i, taak.tekst)}
                            className="px-3 py-1.5 text-xs rounded-lg text-[#9b9b9b] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                          >
                            Bewerken
                          </button>
                        </>
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
