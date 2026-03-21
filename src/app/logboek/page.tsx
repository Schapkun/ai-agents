"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

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

export default function LogboekPage() {
  const [entries, setEntries] = useState<LogboekEntry[]>([]);
  const [laden, setLaden] = useState(true);
  const [openEntry, setOpenEntry] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/logboek")
      .then((r) => r.json())
      .then((data: LogboekEntry[]) => {
        if (Array.isArray(data)) setEntries(data);
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, []);

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Logboek</h1>
            <p className="text-sm text-[#9b9b9b] mt-1">{entries.length} entries</p>
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 mb-3">
                <BookOpen className="h-5 w-5 text-[#9b9b9b]" />
              </div>
              <p className="text-sm text-[#9b9b9b]">Geen logboek entries gevonden</p>
            </div>
          ) : (
            <div className="bg-[#2f2f2f] rounded-xl border border-[#383838] overflow-hidden">
              <div className="divide-y divide-[#383838]/50">
                {entries.map((entry) => {
                  const isOpen = openEntry === entry.datum;
                  return (
                    <div key={entry.datum}>
                      <button
                        onClick={() => setOpenEntry(isOpen ? null : entry.datum)}
                        className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#383838]/30 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#ececec] truncate">{getSamenvatting(entry.inhoud)}</p>
                          <p className="text-xs text-[#9b9b9b] mt-0.5">{formatDatum(entry.datum)}</p>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-[#9b9b9b] shrink-0 ml-3" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-[#9b9b9b] shrink-0 ml-3" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <div className="bg-[#212121] rounded-lg p-4 border border-[#383838]">
                            <pre className="text-sm text-[#ececec] whitespace-pre-wrap font-sans leading-relaxed">{entry.inhoud}</pre>
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
