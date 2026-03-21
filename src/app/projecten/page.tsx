"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

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

function LinkIndicator({ url }: { url: string | null }) {
  if (!url) return <span className="text-muted-foreground/60">-</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/30 animate-ping" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  );
}

function GithubLink({ url }: { url: string | null }) {
  if (!url) return <span className="text-muted-foreground/60">-</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
      <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
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
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projecten</h1>
            <p className="text-sm text-muted-foreground mt-1">{projecten.length} projecten</p>
          </div>
          {laden ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 text-muted-foreground animate-spin" /></div>
          ) : projecten.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent mb-3">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Geen projecten gevonden</p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-0 px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Live domein</TableHead>
                      <TableHead className="w-16 text-center">Dev</TableHead>
                      <TableHead className="w-16 text-center">Live</TableHead>
                      <TableHead className="w-16 text-center">GitHub</TableHead>
                      <TableHead className="text-center">Open</TableHead>
                      <TableHead className="text-center">Afgerond</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projecten.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Link href={`/projecten/${encodeURIComponent(p.naam)}`} className="text-muted-foreground hover:text-foreground hover:underline transition-colors font-medium">
                            {p.naam}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.liveDomein || "-"}</TableCell>
                        <TableCell className="text-center"><LinkIndicator url={p.devServer} /></TableCell>
                        <TableCell className="text-center"><LinkIndicator url={p.liveUrl} /></TableCell>
                        <TableCell className="text-center"><GithubLink url={p.github} /></TableCell>
                        <TableCell className="text-center font-mono">{p.openTaken}</TableCell>
                        <TableCell className="text-center font-mono text-muted-foreground">{p.afgerondeTaken}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
