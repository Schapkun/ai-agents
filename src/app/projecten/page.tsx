"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Loader2, ArrowUpRight } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type ProjectInfo = {
  naam: string;
  beschrijving: string;
  devServer: string | null;
  liveUrl: string | null;
  liveDomein: string | null;
  pad: string | null;
  github: string | null;
  openTaken: number;
  afgerondeTaken: number;
};

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

  function StatusCell({ url, showDot = true }: { url: string | null; showDot?: boolean }) {
    if (!url) {
      return <span className="text-[#666]">-</span>;
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[#9b9b9b] hover:text-[#ececec] transition-colors"
      >
        {showDot && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/30 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
        )}
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
            <p className="text-sm text-[#666] mt-1">{projecten.length} projecten</p>
          </div>

          {laden ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" />
            </div>
          ) : projecten.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] mb-3">
                <FolderOpen className="h-5 w-5 text-[#666]" />
              </div>
              <p className="text-sm text-[#666]">Geen projecten gevonden</p>
            </div>
          ) : (
            <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.05] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="text-left px-5 py-3 text-[10px] font-medium text-[#666] uppercase tracking-wider">Project</th>
                    <th className="text-left px-5 py-3 text-[10px] font-medium text-[#666] uppercase tracking-wider">Live domein</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-[#666] uppercase tracking-wider w-16">Dev</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-[#666] uppercase tracking-wider w-16">Live</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-[#666] uppercase tracking-wider w-16">GitHub</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-[#666] uppercase tracking-wider">Open taken</th>
                    <th className="text-center px-3 py-3 text-[10px] font-medium text-[#666] uppercase tracking-wider">Afgerond</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {projecten.map((project, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-[#ececec]">{project.naam}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-[#9b9b9b]">{project.liveDomein || "-"}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <StatusCell url={project.devServer} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <StatusCell url={project.liveUrl} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <StatusCell url={project.github} showDot={false} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm text-[#ececec] font-mono">{project.openTaken}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm text-[#666] font-mono">{project.afgerondeTaken}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
