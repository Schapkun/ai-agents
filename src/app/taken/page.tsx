"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { CheckSquare, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Taak = { tekst: string; klaar: boolean };
type Project = { naam: string; taken: Taak[] };
type TaakItem = { tekst: string; project: string; klaar: boolean };

export default function TakenPage() {
  const [data, setData] = useState<{ projects: Project[] } | null>(null);
  const [laden, setLaden] = useState(true);
  const [bewerkIndex, setBewerkIndex] = useState<number | null>(null);
  const [bewerkTekst, setBewerkTekst] = useState("");
  const [bevestigIndex, setBevestigIndex] = useState<number | null>(null);
  const [bezig, setBezig] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("open");
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

  function getGetoond() {
    return activeTab === "open" ? openTaken : klaarTaken;
  }

  async function actie(taak: TaakItem, a: string, nieuweTekst?: string) {
    const getoond = getGetoond();
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

  function renderList(taken: TaakItem[], isOpen: boolean) {
    if (laden) {
      return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
    }
    if (taken.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent mb-3">
            <CheckSquare className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{isOpen ? "Geen openstaande taken" : "Geen uitgevoerde taken"}</p>
        </div>
      );
    }
    return (
      <Card>
        <CardContent className="pt-0">
          <div className="divide-y divide-border">
            {taken.map((taak, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {bewerkIndex === i ? (
                    <Input ref={inputRef} type="text" value={bewerkTekst} onChange={e => setBewerkTekst(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") submitBewerking(taak); if (e.key === "Escape") setBewerkIndex(null); }}
                      onBlur={() => submitBewerking(taak)} />
                  ) : (
                    <>
                      <p className={`text-sm ${taak.klaar ? "text-muted-foreground/60 line-through" : "text-muted-foreground"}`}>{taak.tekst}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{taak.project}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {bezig === i ? <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  : bevestigIndex === i ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Zeker weten?</span>
                      <Button variant="destructive" size="sm" onClick={() => actie(taak, "annuleren")}>Ja</Button>
                      <Button variant="secondary" size="sm" onClick={() => setBevestigIndex(null)}>Nee</Button>
                    </div>
                  ) : isOpen ? (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => actie(taak, "uitvoeren")}>Uitvoeren</Button>
                      <Button variant="secondary" size="sm" onClick={() => { setBewerkIndex(i); setBewerkTekst(taak.tekst); }}>Bewerken</Button>
                      <Button variant="destructive" size="sm" onClick={() => setBevestigIndex(i)}>Annuleren</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => actie(taak, "heropenen")}>Heropenen</Button>
                      <Button variant="secondary" size="sm" onClick={() => { setBewerkIndex(i); setBewerkTekst(taak.tekst); }}>Bewerken</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Taken</h1>
          <Tabs defaultValue="open" onValueChange={(v: string | number | null) => { if (typeof v === "string") setActiveTab(v); }}>
            <TabsList className="mb-6">
              <TabsTrigger value="open">Openstaand ({openTaken.length})</TabsTrigger>
              <TabsTrigger value="klaar">Uitgevoerd ({klaarTaken.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open">
              {renderList(openTaken, true)}
            </TabsContent>
            <TabsContent value="klaar">
              {renderList(klaarTaken, false)}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </DashboardLayout>
  );
}
