"use client";

import { useEffect, useState, useMemo } from "react";
import { BookOpen, Loader2, ChevronDown, ChevronUp, Search } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader, SectionCard, Tabs, ActionButton, EmptyState, colors } from "@/components/ui/design";

type LogboekEntry = {
  datum: string;
  inhoud: string;
  categorie: string;
};

function formatDatum(datum: string): string {
  const d = new Date(datum + "T00:00:00");
  const dagen = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const maanden = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
  return `${dagen[d.getDay()]} ${d.getDate()} ${maanden[d.getMonth()]} ${d.getFullYear()}`;
}

function getSamenvatting(inhoud: string): string {
  const regels = inhoud.split("\n");
  const eersteRegel = regels.find((r) => r.trim() && !r.startsWith("#"));
  if (eersteRegel) return eersteRegel.replace(/^[-*]\s*/, "").trim();
  return "Geen samenvatting";
}

function extractCategorieen(entries: LogboekEntry[]): string[] {
  const cats = new Set<string>();
  for (const e of entries) {
    if (e.categorie) cats.add(e.categorie);
    const match = e.inhoud.match(/^#\s+(.+)/m);
    if (match) cats.add(match[1].trim());
  }
  return Array.from(cats).sort();
}

export default function LogboekPage() {
  const [entries, setEntries] = useState<LogboekEntry[]>([]);
  const [laden, setLaden] = useState(true);
  const [openEntry, setOpenEntry] = useState<string | null>(null);
  const [zoekterm, setZoekterm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState<string>("alle");

  useEffect(() => {
    fetch("/api/logboek")
      .then((r) => r.json())
      .then((data: LogboekEntry[]) => {
        if (Array.isArray(data)) setEntries(data);
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, []);

  const categorieen = useMemo(() => extractCategorieen(entries), [entries]);

  const gefilterdeEntries = useMemo(() => {
    let result = entries;

    if (zoekterm.trim()) {
      const term = zoekterm.toLowerCase();
      result = result.filter(
        (e) =>
          e.inhoud.toLowerCase().includes(term) ||
          e.datum.toLowerCase().includes(term) ||
          e.categorie.toLowerCase().includes(term)
      );
    }

    if (filterCategorie !== "alle") {
      result = result.filter((e) => {
        if (e.categorie === filterCategorie) return true;
        const match = e.inhoud.match(/^#\s+(.+)/m);
        return match && match[1].trim() === filterCategorie;
      });
    }

    return result;
  }, [entries, zoekterm, filterCategorie]);

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-2xl font-semibold tracking-tight ${colors.textTitle}`}>Logboek</h1>
            <p className="text-sm text-[#666] mt-1">{entries.length} entries</p>
          </div>

          {/* Zoek + Filter balk */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
              <input
                type="text"
                value={zoekterm}
                onChange={(e) => setZoekterm(e.target.value)}
                placeholder="Zoeken in logboek..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#ececec] placeholder:text-[#666] focus:border-white/[0.12] focus:outline-none transition-colors"
              />
            </div>
            {categorieen.length > 0 && (
              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#ececec] focus:border-white/[0.12] focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="alle">Alle categorieën</option>
                {categorieen.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : gefilterdeEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] mb-3">
                <BookOpen className="h-5 w-5 text-[#666]" />
              </div>
              <p className="text-sm text-[#666]">
                {zoekterm || filterCategorie !== "alle"
                  ? "Geen resultaten gevonden"
                  : "Geen logboek entries gevonden"}
              </p>
            </div>
          ) : (
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="divide-y divide-white/[0.05]">
                {gefilterdeEntries.map((entry) => {
                  const isOpen = openEntry === entry.datum;
                  return (
                    <div key={entry.datum}>
                      <button
                        onClick={() => setOpenEntry(isOpen ? null : entry.datum)}
                        className="flex items-center justify-between w-full px-5 py-4 hover:bg-white/[0.03] transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#9b9b9b] truncate">{getSamenvatting(entry.inhoud)}</p>
                          <p className="text-xs text-[#666] mt-0.5">{formatDatum(entry.datum)}</p>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-[#666] shrink-0 ml-3" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-[#666] shrink-0 ml-3" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.05]">
                            <pre className="text-sm text-[#9b9b9b] whitespace-pre-wrap font-sans leading-relaxed">{entry.inhoud}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
