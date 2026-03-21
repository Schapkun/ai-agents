"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Lightbulb, Loader2, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type Idee = {
  titel: string;
  beschrijving: string;
  status: string;
  datum: string;
  url: string | null;
};

type IdeeenData = {
  ideeen: Idee[];
};

function isUitgevoerd(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("uitgewerkt") || s.includes("in progress") || s.includes("afgerond");
}

export default function IdeeenPage() {
  const [data, setData] = useState<IdeeenData | null>(null);
  const [laden, setLaden] = useState(true);
  const [activeTab, setActiveTab] = useState<"open" | "uitgevoerd">("open");
  const [bewerkIndex, setBewerkIndex] = useState<number | null>(null);
  const [bewerkTitel, setBewerkTitel] = useState("");
  const [bewerkBeschrijving, setBewerkBeschrijving] = useState("");
  const [feedbackIndex, setFeedbackIndex] = useState<number | null>(null);
  const [feedbackTekst, setFeedbackTekst] = useState("");
  const [bezig, setBezig] = useState<number | null>(null);
  const titelRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLTextAreaElement>(null);

  const fetchIdeeen = useCallback(() => {
    fetch("/api/ideeen")
      .then((r) => r.json())
      .then((d: IdeeenData) => {
        setData(d);
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, []);

  useEffect(() => {
    fetchIdeeen();
  }, [fetchIdeeen]);

  useEffect(() => {
    if (bewerkIndex !== null && titelRef.current) titelRef.current.focus();
  }, [bewerkIndex]);

  useEffect(() => {
    if (feedbackIndex !== null && feedbackRef.current) feedbackRef.current.focus();
  }, [feedbackIndex]);

  const ideeen = data?.ideeen ?? [];
  const openIdeeen = ideeen.filter((i) => !isUitgevoerd(i.status));
  const uitgevoerdeIdeeen = ideeen.filter((i) => isUitgevoerd(i.status));
  const getoondeIdeeen = activeTab === "open" ? openIdeeen : uitgevoerdeIdeeen;

  async function handleActie(idee: Idee, actie: string, extra?: Record<string, string>) {
    const idx = getoondeIdeeen.indexOf(idee);
    setBezig(idx);
    try {
      const res = await fetch("/api/ideeen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titel: idee.titel, actie, ...extra }),
      });
      if (res.ok) {
        fetchIdeeen();
      }
    } catch {
      // stil falen
    } finally {
      setBezig(null);
      setBewerkIndex(null);
      setFeedbackIndex(null);
      setFeedbackTekst("");
    }
  }

  function startBewerken(index: number, idee: Idee) {
    setBewerkIndex(index);
    setBewerkTitel(idee.titel);
    setBewerkBeschrijving(idee.beschrijving);
  }

  function submitBewerking(idee: Idee) {
    const titelGewijzigd = bewerkTitel.trim() !== idee.titel;
    const beschrijvingGewijzigd = bewerkBeschrijving.trim() !== idee.beschrijving;
    if (titelGewijzigd || beschrijvingGewijzigd) {
      const extra: Record<string, string> = {};
      if (titelGewijzigd) extra.nieuweTitel = bewerkTitel.trim();
      if (beschrijvingGewijzigd) extra.nieuweBeschrijving = bewerkBeschrijving.trim();
      handleActie(idee, "bewerken", extra);
    } else {
      setBewerkIndex(null);
    }
  }

  function submitFeedback(idee: Idee) {
    if (feedbackTekst.trim()) {
      handleActie(idee, "feedback", { tekst: feedbackTekst.trim() });
    } else {
      setFeedbackIndex(null);
    }
  }

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Ideeën</h1>
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
              Openstaand ({openIdeeen.length})
            </button>
            <button
              onClick={() => setActiveTab("uitgevoerd")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === "uitgevoerd"
                  ? "bg-white/[0.08] text-white font-medium"
                  : "text-[#666] hover:text-[#999]"
              }`}
            >
              Uitgevoerd ({uitgevoerdeIdeeen.length})
            </button>
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : getoondeIdeeen.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] mb-3">
                <Lightbulb className="h-5 w-5 text-[#666]" />
              </div>
              <p className="text-sm text-[#666]">
                {activeTab === "open" ? "Geen openstaande ideeën" : "Geen uitgevoerde ideeën"}
              </p>
            </div>
          ) : (
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="divide-y divide-white/[0.05]">
                {getoondeIdeeen.map((idee, i) => (
                  <div key={i} className="px-5 py-2.5 hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {bewerkIndex === i ? (
                          <div className="space-y-2">
                            <input
                              ref={titelRef}
                              type="text"
                              value={bewerkTitel}
                              onChange={(e) => setBewerkTitel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") setBewerkIndex(null);
                              }}
                              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-[#9b9b9b] outline-none focus:border-white/[0.2]"
                              placeholder="Titel"
                            />
                            <input
                              type="text"
                              value={bewerkBeschrijving}
                              onChange={(e) => setBewerkBeschrijving(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") submitBewerking(idee);
                                if (e.key === "Escape") setBewerkIndex(null);
                              }}
                              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-[#9b9b9b] outline-none focus:border-white/[0.2]"
                              placeholder="Beschrijving"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => submitBewerking(idee)}
                                className="px-3 py-1 text-xs rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
                              >
                                Opslaan
                              </button>
                              <button
                                onClick={() => setBewerkIndex(null)}
                                className="px-3 py-1 text-xs rounded-lg text-[#ececec] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                              >
                                Annuleren
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-[#9b9b9b]">{idee.titel}</p>
                              {idee.url && idee.url !== "-" && (
                                <a
                                  href={idee.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#666] hover:text-[#ececec] transition-colors"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                            {idee.beschrijving && (
                              <p className="text-xs text-[#666] mt-1 leading-relaxed">{idee.beschrijving}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-[#666]">{idee.status}</span>
                              {idee.datum && <span className="text-[10px] text-[#666]">{idee.datum}</span>}
                            </div>
                          </>
                        )}

                        {/* Feedback form */}
                        {feedbackIndex === i && (
                          <div className="mt-3 space-y-2">
                            <textarea
                              ref={feedbackRef}
                              value={feedbackTekst}
                              onChange={(e) => setFeedbackTekst(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") { setFeedbackIndex(null); setFeedbackTekst(""); }
                              }}
                              rows={3}
                              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#9b9b9b] outline-none focus:border-white/[0.2] resize-none"
                              placeholder="Schrijf je feedback..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => submitFeedback(idee)}
                                className="px-3 py-1 text-xs rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
                              >
                                Verstuur
                              </button>
                              <button
                                onClick={() => { setFeedbackIndex(null); setFeedbackTekst(""); }}
                                className="px-3 py-1 text-xs rounded-lg text-[#ececec] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                              >
                                Annuleren
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {bewerkIndex !== i && feedbackIndex !== i && (
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          {bezig === i ? (
                            <Loader2 className="h-4 w-4 text-[#666] animate-spin" />
                          ) : activeTab === "open" ? (
                            <>
                              <button
                                onClick={() => handleActie(idee, "uitwerken")}
                                className="px-3 py-1.5 text-xs rounded-lg text-[#ececec] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                              >
                                Uitwerken
                              </button>
                              <button
                                onClick={() => startBewerken(i, idee)}
                                className="px-3 py-1.5 text-xs rounded-lg text-[#ececec] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                              >
                                Bewerken
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setFeedbackIndex(i); setFeedbackTekst(""); }}
                                className="px-3 py-1.5 text-xs rounded-lg text-[#ececec] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                              >
                                Feedback
                              </button>
                              <button
                                onClick={() => startBewerken(i, idee)}
                                className="px-3 py-1.5 text-xs rounded-lg text-[#ececec] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                              >
                                Bewerken
                              </button>
                            </>
                          )}
                        </div>
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
