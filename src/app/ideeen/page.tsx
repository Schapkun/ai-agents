"use client";

import { useEffect, useState, useRef } from "react";
import { Lightbulb, Loader2, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader, SectionCard, Tabs, ActionButton, EmptyState, ListItem, colors } from "@/components/ui/design";

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
  const getoond = activeTab === "open" ? openIdeeen : uitgevoerdeIdeeen;

  async function actie(idee: Idee, a: string, extra?: Record<string, string>) {
    setBezig(getoond.indexOf(idee));
    try {
      const r = await fetch("/api/ideeen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titel: idee.titel, actie: a, ...extra }) });
      if (r.ok) fetchIdeeen();
    } catch {} finally { setBezig(null); setBewerkIndex(null); setFeedbackIndex(null); }
  }

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-6 py-6">
          <PageHeader title={"Idee\u00EBn"} />
          <Tabs
            tabs={[
              { id: "open", label: "Openstaand", count: openIdeeen.length },
              { id: "uitgevoerd", label: "Uitgevoerd", count: uitgevoerdeIdeeen.length },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
          {laden ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-[#9b9b9b]" /></div>
          ) : getoond.length === 0 ? (
            <EmptyState icon={Lightbulb} message={activeTab === "open" ? "Geen openstaande idee\u00EBn" : "Geen uitgevoerde idee\u00EBn"} />
          ) : (
            <SectionCard>
              <div className={`divide-y ${colors.divider}`}>
                {getoond.map((idee, i) => (
                  <ListItem key={i} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {bewerkIndex === i ? (
                        <div className="space-y-2">
                          <input ref={inputRef} type="text" value={bewerkTitel} onChange={e => setBewerkTitel(e.target.value)}
                            className={`w-full ${colors.btnBg} border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm ${colors.textContent} outline-none focus:border-white/[0.2]`} />
                          <input type="text" value={bewerkBeschrijving} onChange={e => setBewerkBeschrijving(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") actie(idee, "bewerken", { nieuweTitel: bewerkTitel, nieuweBeschrijving: bewerkBeschrijving }); if (e.key === "Escape") setBewerkIndex(null); }}
                            className={`w-full ${colors.btnBg} border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs ${colors.textContent} outline-none focus:border-white/[0.2]`}
                            placeholder="Beschrijving" />
                          <ActionButton onClick={() => actie(idee, "bewerken", { nieuweTitel: bewerkTitel, nieuweBeschrijving: bewerkBeschrijving })}>Opslaan</ActionButton>
                        </div>
                      ) : feedbackIndex === i ? (
                        <div className="space-y-2">
                          <p className={`text-sm ${colors.textContent}`}>{idee.titel}</p>
                          <input type="text" value={feedbackTekst} onChange={e => setFeedbackTekst(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && feedbackTekst.trim()) actie(idee, "feedback", { tekst: feedbackTekst }); if (e.key === "Escape") setFeedbackIndex(null); }}
                            placeholder="Feedback..."
                            className={`w-full ${colors.btnBg} border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm ${colors.textContent} outline-none focus:border-white/[0.2]`} />
                          <ActionButton onClick={() => { if (feedbackTekst.trim()) actie(idee, "feedback", { tekst: feedbackTekst }); }}>Verstuur</ActionButton>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${colors.textContent}`}>{idee.titel}</p>
                            {idee.url && idee.url !== "-" && (
                              <a href={idee.url} target="_blank" rel="noopener noreferrer" className={`${colors.textMuted} hover:text-white transition-colors`}>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {idee.beschrijving && <p className={`text-xs ${colors.textMuted} mt-1 leading-relaxed`}>{idee.beschrijving}</p>}
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[10px] ${colors.textMuted}`}>{idee.status}</span>
                            {idee.datum && <span className={`text-[10px] ${colors.textMuted}`}>{idee.datum}</span>}
                          </div>
                        </>
                      )}
                    </div>
                    {bewerkIndex !== i && feedbackIndex !== i && (
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        {bezig === i ? <Loader2 className={`h-4 w-4 ${colors.textMuted} animate-spin`} />
                        : activeTab === "open" ? (
                          <>
                            <ActionButton onClick={() => actie(idee, "uitwerken")}>Uitwerken</ActionButton>
                            <ActionButton onClick={() => { setBewerkIndex(i); setBewerkTitel(idee.titel); setBewerkBeschrijving(idee.beschrijving); }}>Bewerken</ActionButton>
                          </>
                        ) : (
                          <>
                            <ActionButton onClick={() => { setFeedbackIndex(i); setFeedbackTekst(""); }}>Feedback</ActionButton>
                            <ActionButton onClick={() => { setBewerkIndex(i); setBewerkTitel(idee.titel); setBewerkBeschrijving(idee.beschrijving); }}>Bewerken</ActionButton>
                          </>
                        )}
                      </div>
                    )}
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
