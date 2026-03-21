"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Loader2, ArrowUpRight } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type ProjectInfo = {
  naam: string;
  beschrijving: string;
  devServer: string | null;
  liveUrl: string | null;
  pad: string | null;
  github: string | null;
};

type Taak = {
  tekst: string;
  klaar: boolean;
};

type TakenProject = {
  naam: string;
  taken: Taak[];
};

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
    const exact = takenPerProject[projectNaam];
    if (exact !== undefined) return exact;
    const key = Object.keys(takenPerProject).find(
      (k) => k.toLowerCase().includes(projectNaam.toLowerCase()) ||
             projectNaam.toLowerCase().includes(k.toLowerCase())
    );
    return key ? takenPerProject[key] : 0;
  }

  function LinkCell({ url }: { url: string | null }) {
    if (!url) {
      return <span className="text-[#555]">-</span>;
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[#9b9b9b] hover:text-white transition-colors"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/30 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    );
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
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] shadow-lg shadow-black/20 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider">Project</th>
                    <th className="text-left px-5 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider">Beschrijving</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider">Open taken</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider w-16">Dev</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider w-16">Live</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-[#9b9b9b] uppercase tracking-wider w-16">GitHub</th>
                  </tr>
                </thead>
                <tbody>
                  {projecten.map((project, i) => {
                    const openCount = getOpenTaken(project.naam);
                    return (
                      <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium text-white">{project.naam}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-[#9b9b9b] line-clamp-1">{project.beschrijving || "-"}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-sm text-[#ececec] font-mono">{openCount}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <LinkCell url={project.devServer} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <LinkCell url={project.liveUrl} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <LinkCell url={project.github} />
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
