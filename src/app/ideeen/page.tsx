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

function isUitgevoerd(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("uitgewerkt") || s.includes("in progress") || s.includes("afgerond");
}

export default function IdeeenPage() {
  const [data, setData] = useState<IdeeenData | null>(null);
  const [laden, setLaden] = useState(true);
  const [activeTab, setActiveTab] = useState<"open" | "uitgevoerd">("open");

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
  const openIdeeen = ideeen.filter((i) => !isUitgevoerd(i.status));
  const uitgevoerdeIdeeen = ideeen.filter((i) => isUitgevoerd(i.status));
  const getoondeIdeeen = activeTab === "open" ? openIdeeen : uitgevoerdeIdeeen;

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
            <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.05] overflow-hidden">
              <div className="divide-y divide-white/[0.04]">
                {getoondeIdeeen.map((idee, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-[#ececec]">{idee.titel}</p>
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
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {activeTab === "open" ? (
                        <>
                          <button className="px-3 py-1.5 text-xs rounded-lg text-[#666] hover:text-[#ececec] transition-colors">
                            Uitwerken
                          </button>
                          <button className="px-3 py-1.5 text-xs rounded-lg text-[#666] hover:text-[#ececec] transition-colors">
                            Bewerken
                          </button>
                        </>
                      ) : (
                        <button className="px-3 py-1.5 text-xs rounded-lg text-[#666] hover:text-[#ececec] transition-colors">
                          Feedback
                        </button>
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
