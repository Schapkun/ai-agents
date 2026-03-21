"use client";

import { useEffect, useState } from "react";
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

function statusKleur(status: string): string {
  switch (status.toLowerCase()) {
    case "nieuw": return "bg-white/10 text-white";
    case "in progress": return "bg-green-500/10 text-green-400";
    case "uitgewerkt concept": return "bg-white/20 text-white";
    case "geparkeerd": return "bg-[#acacbe]/10 text-[#acacbe]";
    default: return "bg-white/10 text-[#acacbe]";
  }
}

export default function IdeeenPage() {
  const [data, setData] = useState<IdeeenData | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    fetch("/api/ideeen")
      .then((r) => r.json())
      .then((d: IdeeenData) => {
        setData(d);
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, []);

  const ideeen = data?.ideeen ?? [];

  const ideeenHeader = (
    <div>
      <h1 className="text-base font-semibold tracking-tight">Idee\u00ebn</h1>
      <p className="text-[10px] text-[#acacbe]">{ideeen.length} idee\u00ebn</p>
    </div>
  );

  return (
    <DashboardLayout header={ideeenHeader}>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#acacbe] animate-spin" />
            </div>
          ) : ideeen.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 mb-3">
                <Lightbulb className="h-5 w-5 text-[#acacbe]" />
              </div>
              <p className="text-sm text-[#acacbe]">Geen idee\u00ebn gevonden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideeen.map((idee, i) => (
                <div key={i} className="bg-[#40414f] rounded-2xl border border-[#4d4d4f] p-5 hover:border-[#acacbe]/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-sm font-medium text-white leading-snug">{idee.titel}</h3>
                    <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${statusKleur(idee.status)}`}>
                      {idee.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#acacbe] leading-relaxed mb-4">{idee.beschrijving}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#acacbe]/60">{idee.datum}</span>
                    {idee.url && idee.url !== "-" && (
                      <a
                        href={idee.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-[#acacbe] hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Link
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
