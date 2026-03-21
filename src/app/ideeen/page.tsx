"use client";

import { useEffect, useState, useRef } from "react";
import { Lightbulb, Loader2, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Idee = { titel: string; beschrijving: string; status: string; datum: string; url: string | null };

function isUitgevoerd(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("uitgewerkt") || s.includes("in progress") || s.includes("afgerond");
}

export default function IdeeenPage() {
  const [ideeen, setIdeeen] = useState<Idee[]>([]);
  const [laden, setLaden] = useState(true);
  const [activeTab, setActiveTab] = useState("open");
  const [bewerkIndex, setBewerkIndex] = useState<number | null>(null);
  const [bewerkTitel, setBewerkTitel] = useState("");
  const [bewerkBeschrijving, setBewerkBeschrijving] = useState("");
  const [feedbackIndex, setFeedbackIndex] = useState<number | null>(null);
  const [feedbackTekst, setFeedbackTekst] = useState("");
  const [bezig, setBezig] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function fetchIdeeen() {
    fetch("/api/ideeen").then(r => r.json()).then(d => { setIdeeen(d.ideeen ?? []); setLaden(false); }).catch(() => setLaden(false));
  }
  useEffect(() => { fetchIdeeen(); }, []);
  useEffect(() => { if (bewerkIndex !== null && inputRef.current) inputRef.current.focus(); }, [bewerkIndex]);

  const openIdeeen = ideeen.filter(i => !isUitgevoerd(i.status));
  const uitgevoerdeIdeeen = ideeen.filter(i => isUitgevoerd(i.status));

  function getGetoond() {
    return activeTab === "open" ? openIdeeen : uitgevoerdeIdeeen;
  }

  async function actie(idee: Idee, a: string, extra?: Record<string, string>) {
    const getoond = getGetoond();
    setBezig(getoond.indexOf(idee));
    try {
      const r = await fetch("/api/ideeen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titel: idee.titel, actie: a, ...extra }) });
      if (r.ok) fetchIdeeen();
    } catch {} finally { setBezig(null); setBewerkIndex(null); setFeedbackIndex(null); }
  }

  function renderList(lijst: Idee[], isOpen: boolean) {
    if (laden) {
      return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
    }
    if (lijst.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent mb-3">
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{isOpen ? "Geen openstaande ideeën" : "Geen uitgevoerde ideeën"}</p>
        </div>
      );
    }
    return (
      <Card>
        <CardContent className="pt-0">
          <div className="divide-y divide-border">
            {lijst.map((idee, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {bewerkIndex === i ? (
                    <div className="space-y-2">
                      <Input ref={inputRef} type="text" value={bewerkTitel} onChange={e => setBewerkTitel(e.target.value)} />
                      <Input type="text" value={bewerkBeschrijving} onChange={e => setBewerkBeschrijving(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") actie(idee, "bewerken", { nieuweTitel: bewerkTitel, nieuweBeschrijving: bewerkBeschrijving }); if (e.key === "Escape") setBewerkIndex(null); }}
                        placeholder="Beschrijving" />
                      <Button variant="secondary" size="sm" onClick={() => actie(idee, "bewerken", { nieuweTitel: bewerkTitel, nieuweBeschrijving: bewerkBeschrijving })}>Opslaan</Button>
                    </div>
                  ) : feedbackIndex === i ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{idee.titel}</p>
                      <Input type="text" value={feedbackTekst} onChange={e => setFeedbackTekst(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && feedbackTekst.trim()) actie(idee, "feedback", { tekst: feedbackTekst }); if (e.key === "Escape") setFeedbackIndex(null); }}
                        placeholder="Feedback..." />
                      <Button variant="secondary" size="sm" onClick={() => { if (feedbackTekst.trim()) actie(idee, "feedback", { tekst: feedbackTekst }); }}>Verstuur</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{idee.titel}</p>
                        {idee.url && idee.url !== "-" && (
                          <a href={idee.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      {idee.beschrijving && <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed">{idee.beschrijving}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground/60">{idee.status}</span>
                        {idee.datum && <span className="text-xs text-muted-foreground/60">{idee.datum}</span>}
                      </div>
                    </>
                  )}
                </div>
                {bewerkIndex !== i && feedbackIndex !== i && (
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {bezig === i ? <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    : isOpen ? (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => actie(idee, "uitwerken")}>Uitwerken</Button>
                        <Button variant="secondary" size="sm" onClick={() => { setBewerkIndex(i); setBewerkTitel(idee.titel); setBewerkBeschrijving(idee.beschrijving); }}>Bewerken</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => { setFeedbackIndex(i); setFeedbackTekst(""); }}>Feedback</Button>
                        <Button variant="secondary" size="sm" onClick={() => { setBewerkIndex(i); setBewerkTitel(idee.titel); setBewerkBeschrijving(idee.beschrijving); }}>Bewerken</Button>
                      </>
                    )}
                  </div>
                )}
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Ideeën</h1>
          <Tabs defaultValue="open" onValueChange={(v: string | number | null) => { if (typeof v === "string") setActiveTab(v); }}>
            <TabsList className="mb-6">
              <TabsTrigger value="open">Openstaand ({openIdeeen.length})</TabsTrigger>
              <TabsTrigger value="uitgevoerd">Uitgevoerd ({uitgevoerdeIdeeen.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open">
              {renderList(openIdeeen, true)}
            </TabsContent>
            <TabsContent value="uitgevoerd">
              {renderList(uitgevoerdeIdeeen, false)}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </DashboardLayout>
  );
}
