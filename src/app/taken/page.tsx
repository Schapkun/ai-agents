"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { CheckSquare, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader, SectionCard, Tabs, ActionButton, EmptyState, ListItem, colors } from "@/components/ui/design";

type Taak = { tekst: string; klaar: boolean };
type Project = { naam: string; taken: Taak[] };
type TaakItem = { tekst: string; project: string; klaar: boolean };

export default function TakenPage() {
  const [data, setData] = useState<{ projects: Project[] } | null>(null);
  const [laden, setLaden] = useState(true);
  const [activeTab, setActiveTab] = useState("open");
  const [bewerkIndex, setBewerkIndex] = useState<number | null>(null);
  const [bewerkTekst, setBewerkTekst] = useState("");
  const [bevestigIndex, setBevestigIndex] = useState<number | null>(null);
  const [bezig, setBezig] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTaken = useCallback(() => {
    fetch("/api/taken").then(r => r.json()).then(d => { setData(d); setLaden(false); }).catch(() => setLaden(false));
  }, []);

  useEffect(() => { fetchTaken(); }, [fetchTaken]);
  useEffect(() => { if (bewerkIndex !== null && inputRef.current) inputRef.current.focus(); }, [bewerkIndex]);

  const alleTaken: TaakItem[] = [];
  for (const p of data?.projects ?? []) for (const t of p.taken) alleTaken.push({ tekst: t.tekst, project: p.naam, klaar: t.klaar });
  const openTaken = alleTaken.filter(t => !t.klaar);
  const klaarTaken = alleTaken.filter(t => t.klaar);
  const getoond = activeTab === "open" ? openTaken : klaarTaken;

  async function actie(taak: TaakItem, a: string, nieuweTekst?: string) {
    setBezig(getoond.indexOf(taak));
    try {
      const r = await fetch("/api/taken", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: taak.project, taak: taak.tekst, actie: a, nieuweTekst }) });
      if (r.ok) fetchTaken();
    } catch {} finally { setBezig(null); setBewerkIndex(null); setBevestigIndex(null); }
  }

  function submitBewerking(taak: TaakItem) {
    if (bewerkTekst.trim() && bewerkTekst.trim() !== taak.tekst) actie(taak, "bewerken", bewerkTekst.trim());
    else setBewerkIndex(null);
  }

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-6 py-6">
          <PageHeader title="Taken" />
          <Tabs
            tabs={[
              { id: "open", label: "Openstaand", count: openTaken.length },
              { id: "klaar", label: "Uitgevoerd", count: klaarTaken.length },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
          {laden ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-[#9b9b9b]" /></div>
          ) : getoond.length === 0 ? (
            <EmptyState icon={CheckSquare} message={activeTab === "open" ? "Geen openstaande taken" : "Geen uitgevoerde taken"} />
          ) : (
            <SectionCard>
              <div className={`divide-y ${colors.divider}`}>
                {getoond.map((taak, i) => (
                  <ListItem key={i} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {bewerkIndex === i ? (
                        <input ref={inputRef} type="text" value={bewerkTekst} onChange={e => setBewerkTekst(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") submitBewerking(taak); if (e.key === "Escape") setBewerkIndex(null); }}
                          onBlur={() => submitBewerking(taak)}
                          className={`w-full ${colors.btnBg} border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm ${colors.textContent} outline-none focus:border-white/[0.2]`} />
                      ) : (
                        <>
                          <p className={`text-sm ${taak.klaar ? `${colors.textMuted} line-through` : colors.textContent}`}>{taak.tekst}</p>
                          <p className={`text-[10px] ${colors.textMuted} mt-0.5`}>{taak.project}</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {bezig === i ? <Loader2 className={`h-4 w-4 ${colors.textMuted} animate-spin`} />
                      : bevestigIndex === i ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${colors.textContent}`}>Zeker weten?</span>
                          <ActionButton variant="danger" onClick={() => actie(taak, "annuleren")}>Ja</ActionButton>
                          <ActionButton onClick={() => setBevestigIndex(null)}>Nee</ActionButton>
                        </div>
                      ) : activeTab === "open" ? (
                        <>
                          <ActionButton onClick={() => actie(taak, "uitvoeren")}>Uitvoeren</ActionButton>
                          <ActionButton onClick={() => { setBewerkIndex(i); setBewerkTekst(taak.tekst); }}>Bewerken</ActionButton>
                          <ActionButton variant="danger" onClick={() => setBevestigIndex(i)}>Annuleren</ActionButton>
                        </>
                      ) : (
                        <>
                          <ActionButton onClick={() => actie(taak, "heropenen")}>Heropenen</ActionButton>
                          <ActionButton onClick={() => { setBewerkIndex(i); setBewerkTekst(taak.tekst); }}>Bewerken</ActionButton>
                        </>
                      )}
                    </div>
                  </ListItem>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
