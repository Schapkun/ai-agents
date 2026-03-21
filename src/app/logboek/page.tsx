"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LogboekEntry = { datum: string; inhoud: string; categorie: string };

function formatDatum(datum: string): string {
  const d = new Date(datum + "T00:00:00");
  const dagen = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const maanden = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
  return `${dagen[d.getDay()]} ${d.getDate()} ${maanden[d.getMonth()]} ${d.getFullYear()}`;
}

function getSamenvatting(inhoud: string): string {
  const regel = inhoud.split("\n").find(r => r.trim() && !r.startsWith("#"));
  if (!regel) return inhoud.slice(0, 100);
  return regel.replace(/^[-*]\s*/, "").replace(/\*\*/g, "").trim();
}

export default function LogboekPage() {
  const [entries, setEntries] = useState<LogboekEntry[]>([]);
  const [laden, setLaden] = useState(true);
  const [zoek, setZoek] = useState("");
  const [categorie, setCategorie] = useState("alle");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/logboek").then(r => r.json()).then((d: LogboekEntry[]) => {
      if (Array.isArray(d)) setEntries(d);
      setLaden(false);
    }).catch(() => setLaden(false));
  }, []);

  const categorieen = [...new Set(entries.map(e => e.categorie).filter(Boolean))];
  const gefilterd = entries.filter(e => {
    if (zoek && !e.inhoud.toLowerCase().includes(zoek.toLowerCase()) && !e.datum.includes(zoek)) return false;
    if (categorie !== "alle" && e.categorie !== categorie) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-6 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Logboek</h1>
            <p className="text-sm text-muted-foreground mt-1">{entries.length} entries</p>
          </div>

          {/* Zoek + filter */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Zoeken in logboek..." value={zoek} onChange={e => setZoek(e.target.value)}
                className="pl-9" />
            </div>
            {categorieen.length > 0 && (
              <select value={categorie} onChange={e => setCategorie(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-input bg-transparent text-foreground focus:border-ring focus:outline-none transition-colors appearance-none cursor-pointer">
                <option value="alle">Alle categorieën</option>
                {categorieen.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : gefilterd.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent mb-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{zoek || categorie !== "alle" ? "Geen resultaten" : "Geen logboek entries"}</p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  {gefilterd.map((entry, i) => (
                    <div key={i}>
                      <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="flex items-center justify-between w-full py-2.5 hover:bg-muted/50 transition-colors text-left">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground truncate">{getSamenvatting(entry.inhoud)}</p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">{formatDatum(entry.datum)}</p>
                        </div>
                        <div className="shrink-0 ml-3">
                          {openIndex === i
                            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {openIndex === i && (
                        <div className="pb-4 pt-1">
                          <div className="bg-muted rounded-lg p-4 border border-border">
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{entry.inhoud}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
