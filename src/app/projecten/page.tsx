"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type ProjectInfo = {
  naam: string;
  beschrijving: string;
  status: string;
};

function statusDot(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("actief") || s.includes("in progress")) return "bg-green-500";
  if (s.includes("geparkeerd") || s.includes("pauze")) return "bg-yellow-500";
  if (s.includes("afgerond") || s.includes("klaar")) return "bg-[#9b9b9b]";
  return "bg-green-500";
}

export default function ProjectenPage() {
  const [projecten, setProjecten] = useState<ProjectInfo[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    fetch("/api/projecten")
      .then((r) => r.json())
      .then((data: { projecten: ProjectInfo[] }) => {
        setProjecten(data.projecten ?? []);
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
            <h1 className="text-2xl font-semibold tracking-tight text-white">Projecten</h1>
            <p className="text-sm text-[#9b9b9b] mt-1">{projecten.length} projecten</p>
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : projecten.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 mb-3">
                <FolderOpen className="h-5 w-5 text-[#9b9b9b]" />
              </div>
              <p className="text-sm text-[#9b9b9b]">Geen projecten gevonden</p>
            </div>
          ) : (
            <div className="bg-[#2f2f2f] rounded-xl border border-[#383838] overflow-hidden">
              <div className="divide-y divide-[#383838]/50">
                {projecten.map((project, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-[#383838]/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white">{project.naam}</h3>
                      {project.beschrijving && (
                        <p className="text-xs text-[#9b9b9b] mt-1 leading-relaxed">{project.beschrijving}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className={`h-2 w-2 rounded-full ${statusDot(project.status)}`} />
                      <span className="text-xs text-[#9b9b9b]">{project.status}</span>
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
