"use client";

import { useEffect, useState } from "react";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LogboekEntry = {
  datum: string;
  inhoud: string;
  categorie: string;
};

function formatDatum(datum: string): string {
  const d = new Date(datum + "T00:00:00");
  const dagen = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const maanden = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
  ];
  return `${dagen[d.getDay()]} ${d.getDate()} ${maanden[d.getMonth()]} ${d.getFullYear()}`;
}

function isVandaag(datum: string): boolean {
  const vandaag = new Date().toISOString().split("T")[0];
  return datum === vandaag;
}

export default function LogboekPage() {
  const [entries, setEntries] = useState<LogboekEntry[]>([]);
  const [geselecteerd, setGeselecteerd] = useState<string | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    fetch("/api/logboek")
      .then((r) => r.json())
      .then((data: LogboekEntry[]) => {
        setEntries(data);
        if (data.length > 0) {
          setGeselecteerd(data[0].datum);
        }
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, []);

  const actieveEntry = entries.find((e) => e.datum === geselecteerd);

  const datumLijst = (
    <div className="flex-1 overflow-y-auto px-3 pt-2 pb-3 space-y-0.5">
      <p className="px-3 pt-2 pb-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
        Entries
      </p>
      {entries.map((entry) => (
        <button
          key={entry.datum}
          onClick={() => setGeselecteerd(entry.datum)}
          className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            entry.datum === geselecteerd
              ? "bg-zinc-800/60 text-white font-medium"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {formatDatum(entry.datum)}
          </span>
          {isVandaag(entry.datum) && (
            <span className="ml-auto text-[10px] font-medium bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
              vandaag
            </span>
          )}
        </button>
      ))}
    </div>
  );

  const logboekHeader = (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Logboek</h1>
      <p className="text-[10px] text-zinc-500">
        {entries.length} entries &middot; dagelijkse sessie logs
      </p>
    </div>
  );

  return (
    <DashboardLayout activePage="logboek" sidebarExtra={datumLijst} header={logboekHeader}>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {laden ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-zinc-900/60 border border-zinc-800/40 animate-pulse"
                />
              ))}
            </div>
          ) : !actieveEntry ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 ring-1 ring-zinc-700/30 mb-4">
                <BookOpen className="h-7 w-7 text-zinc-500" />
              </div>
              <h2 className="text-base font-medium text-zinc-400">
                Geen logboek entries gevonden
              </h2>
              <p className="mt-1.5 text-sm text-zinc-600 max-w-sm">
                Er zijn nog geen logboek bestanden beschikbaar.
              </p>
            </div>
          ) : (
            <article className="rounded-xl bg-zinc-900/60 border border-zinc-800/40 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/40">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <BookOpen className="h-4.5 w-4.5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-200">
                    {formatDatum(actieveEntry.datum)}
                  </h2>
                  <p className="text-[10px] text-zinc-500">{actieveEntry.datum}</p>
                </div>
                {isVandaag(actieveEntry.datum) && (
                  <span className="ml-auto text-[10px] font-medium bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    vandaag
                  </span>
                )}
              </div>

              <div className="px-6 py-5 prose-logboek">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-base font-semibold text-zinc-100 mb-4 mt-2 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-semibold text-zinc-200 mb-3 mt-6 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold text-zinc-300 mb-2 mt-4">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-1.5 mb-4 ml-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-1.5 mb-4 ml-1 list-decimal list-inside">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-zinc-400 leading-relaxed flex gap-2">
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 mt-0.5" />
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-zinc-200">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-zinc-300">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">
                        {children}
                      </code>
                    ),
                    hr: () => (
                      <hr className="border-zinc-800/60 my-5" />
                    ),
                  }}
                >
                  {actieveEntry.inhoud}
                </ReactMarkdown>
              </div>
            </article>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
