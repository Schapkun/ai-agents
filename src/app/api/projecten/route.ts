import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MEMORY_PATH = process.env.MEMORY_PATH || "/Users/doerak/.claude/projects/-Users-doerak/memory/";

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

// Bekende project info die niet altijd in memory staat
const BEKENDE_INFO: Record<string, { dev?: string; live?: string; liveDomein?: string; github?: string }> = {
  "mijn project agents": { dev: "http://192.168.1.131:3000", live: "https://agents.schapkun.com", liveDomein: "agents.schapkun.com", github: "https://github.com/Schapkun/ai-agents" },
  "meester hendrik": { dev: "http://192.168.1.131:3006", live: "https://meester-hendrik.vercel.app", liveDomein: "meester-hendrik.vercel.app", github: "https://github.com/Schapkun/meester-hendrik" },
  "configurator": { dev: "http://192.168.1.131:3008", github: "https://github.com/Schapkun/configurator" },
  "factuur v1": { dev: "http://192.168.1.131:3001" },
  "stayops": { dev: "http://192.168.1.131:3007" },
  "mattie": {},
  "voortgang": { dev: "http://192.168.1.131:3000" },
};

function parseFrontmatter(inhoud: string): Record<string, string> {
  const fm: Record<string, string> = {};
  const match = inhoud.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return fm;
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return fm;
}

function parseTakenUitBestand(inhoud: string): { open: number; afgerond: number } {
  let open = 0, afgerond = 0;
  for (const regel of inhoud.split("\n")) {
    if (regel.match(/^[-*]\s*\[ \]\s+.+/)) open++;
    else if (regel.match(/^[-*]\s*\[x\]\s+.+/i)) afgerond++;
  }
  return { open, afgerond };
}

export async function GET() {
  const projecten: ProjectInfo[] = [];

  try {
    // Lees taken counts
    const takenCounts: Record<string, { open: number; afgerond: number }> = {};
    try {
      const bestanden = await fs.readdir(MEMORY_PATH);
      for (const b of bestanden.filter((f) => f.endsWith("_taken.md"))) {
        try {
          const inhoud = await fs.readFile(path.join(MEMORY_PATH, b), "utf-8");
          const key = b.replace(/_taken\.md$/, "").replace(/[-_]/g, " ").toLowerCase();
          takenCounts[key] = parseTakenUitBestand(inhoud);
        } catch { continue; }
      }
    } catch {}

    // Lees project bestanden
    const bestanden = await fs.readdir(MEMORY_PATH);
    for (const b of bestanden.filter((f) => f.startsWith("project_") && f.endsWith(".md"))) {
      try {
        const inhoud = await fs.readFile(path.join(MEMORY_PATH, b), "utf-8");
        const fm = parseFrontmatter(inhoud);

        let naam = fm.name || "";
        if (!naam) {
          const h = inhoud.match(/^#\s+(.+)/m);
          naam = h ? h[1].trim() : b.replace(/^project_/, "").replace(/\.md$/, "").replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        }

        const beschrijving = fm.description || "";
        const naamLower = naam.toLowerCase();

        // Zoek bekende info
        const bekend = Object.entries(BEKENDE_INFO).find(([k]) =>
          naamLower.includes(k) || k.includes(naamLower) ||
          naamLower.split(" ").some(w => k.includes(w) && w.length > 3)
        );
        const info = bekend ? bekend[1] : {};

        // Zoek taken counts
        let openTaken = 0, afgerondeTaken = 0;
        for (const [key, counts] of Object.entries(takenCounts)) {
          if (naamLower.includes(key) || key.includes(naamLower) ||
              naamLower.split(" ").some(w => key.includes(w) && w.length > 3)) {
            openTaken = counts.open;
            afgerondeTaken = counts.afgerond;
            break;
          }
        }

        projecten.push({
          naam,
          beschrijving,
          devServer: info.dev || null,
          liveUrl: info.live || null,
          liveDomein: info.liveDomein || null,
          github: info.github || null,
          openTaken,
          afgerondeTaken,
        });
      } catch { continue; }
    }

    projecten.sort((a, b) => a.naam.localeCompare(b.naam));
    return NextResponse.json({ projecten });
  } catch {
    return NextResponse.json({ projecten: [] });
  }
}
