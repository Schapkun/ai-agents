"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader, SectionCard, Th, Td, Tr, EmptyState } from "@/components/ui/design";

type ProjectInfo = {
  naam: string;
  beschrijving: string;
  devServer: string | null;
  liveUrl: string | null;
  liveDomein: string | null;
  github: string | null;
  openTaken: number;
  afgerondeTaken: number;
};

function LinkCell({ url }: { url: string | null }) {
  if (!url) return <Td align="center" muted>-</Td>;
  return (
    <Td align="center">
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#9b9b9b] hover:text-white transition-colors">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/30 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </Td>
  );
}

function GithubCell({ url }: { url: string | null }) {
  if (!url) return <Td align="center" muted>-</Td>;
  return (
    <Td align="center">
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#9b9b9b] hover:text-white transition-colors">
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </Td>
  );
}

export default function ProjectenPage() {
  const [projecten, setProjecten] = useState<ProjectInfo[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    fetch("/api/projecten").then(r => r.json())
      .then((d: { projecten: ProjectInfo[] }) => { setProjecten(d.projecten ?? []); setLaden(false); })
      .catch(() => setLaden(false));
  }, []);

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="px-6 py-6">
          <PageHeader title="Projecten" subtitle={`${projecten.length} projecten`} />
          {laden ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 text-[#9b9b9b] animate-spin" /></div>
          ) : projecten.length === 0 ? (
            <EmptyState icon={FolderOpen} message="Geen projecten gevonden" />
          ) : (
            <SectionCard>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <Th>Project</Th>
                    <Th>Live domein</Th>
                    <Th align="center" className="w-16">Dev</Th>
                    <Th align="center" className="w-16">Live</Th>
                    <Th align="center" className="w-16">GitHub</Th>
                    <Th align="center">Open</Th>
                    <Th align="center">Afgerond</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {projecten.map((p, i) => (
                    <Tr key={i}>
                      <Td>
                        <Link href={`/projecten/${encodeURIComponent(p.naam)}`} className="text-[#9b9b9b] hover:text-white hover:underline transition-colors font-medium">
                          {p.naam}
                        </Link>
                      </Td>
                      <Td muted>{p.liveDomein || "-"}</Td>
                      <LinkCell url={p.devServer} />
                      <LinkCell url={p.liveUrl} />
                      <GithubCell url={p.github} />
                      <Td align="center" mono>{p.openTaken}</Td>
                      <Td align="center" mono muted>{p.afgerondeTaken}</Td>
                    </Tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
