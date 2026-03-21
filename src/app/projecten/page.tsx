"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type ProjectInfo = {
  naam: string;
  beschrijving: string;
  status: string;
};

type Taak = {
  tekst: string;
  klaar: boolean;
};

type TakenProject = {
  naam: string;
  taken: Taak[];
};

function statusKleur(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("actief") || s.includes("in progress")) return "bg-green-500";
  if (s.includes("geparkeerd") || s.includes("pauze")) return "bg-yellow-500";
  if (s.includes("afgerond") || s.includes("klaar")) return "bg-[#9b9b9b]";
  return "bg-green-500";
}

export default function ProjectenPage() {
  const [projecten, setProjecten] = useState<ProjectInfo[]>([]);
  const [takenPerProject, setTakenPerProject] = useState<Record<string, number>>({});
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    let geladen = 0;
    const check = () => { geladen++; if (geladen >= 2) setLaden(false); };

    fetch("/api/projecten")
      .then((r) => r.json())
      .then((data: { projecten: ProjectInfo[] }) => {
        setProjecten(data.projecten ?? []);
      })
      .catch(() => {})
      .finally(check);

    fetch("/api/taken")
      .then((r) => r.json())
      .then((data: { projects: TakenProject[] }) => {
        const counts: Record<string, number> = {};
        for (const p of data.projects ?? []) {
          counts[p.naam] = p.taken.filter((t) => !t.klaar).length;
        }
        setTakenPerProject(counts);
      })
      .catch(() => {})
      .finally(check);
  }, []);

  function getOpenTaken(projectNaam: string): number {
    // Fuzzy match project naam met taken project naam
    const exact = takenPerProject[projectNaam];
    if (exact !== undefined) return exact;
    const key = Object.keys(takenPerProject).find(
      (k) => k.toLowerCase().includes(projectNaam.toLowerCase()) ||
             projectNaam.toLowerCase().includes(k.toLowerCase())
    );
    return key ? takenPerProject[key] : 0;
  }

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-8 py-8">
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
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#383838]">
                    <th className="text-left px-5 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider">Project</th>
                    <th className="text-left px-5 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider">Beschrijving</th>
                    <th className="text-center px-5 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider">Open taken</th>
                    <th className="text-right px-5 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projecten.map((project, i) => {
                    const openCount = getOpenTaken(project.naam);
                    return (
                      <tr key={i} className="border-b border-[#383838]/50 hover:bg-[#383838]/30 transition-colors">
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium text-white">{project.naam}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-[#9b9b9b] line-clamp-1">{project.beschrijving || "\u2014"}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {openCount > 0 ? (
                            <span className="text-sm text-[#ececec] font-mono">{openCount}</span>
                          ) : (
                            <span className="text-sm text-[#9b9b9b]">\u2014</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`h-2 w-2 rounded-full ${statusKleur(project.status)}`} />
                            <span className="text-xs text-[#9b9b9b]">{project.status}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
