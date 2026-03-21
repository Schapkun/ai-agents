import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MEMORY_PATH = process.env.MEMORY_PATH || "/Users/doerak/.claude/projects/-Users-doerak/memory/";
const DEV_SERVERS_FILE = "reference_dev_servers.md";

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

function parseFrontmatter(inhoud: string): Record<string, string> {
  const fm: Record<string, string> = {};
  const match = inhoud.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return fm;
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      fm[key] = val;
    }
  }
  return fm;
}

function extractField(inhoud: string, pattern: RegExp): string | null {
  const match = inhoud.match(pattern);
  return match ? match[1].trim() : null;
}

function extractDomein(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

function parseDevServers(inhoud: string): Record<string, { poort: string; pad: string }> {
  const servers: Record<string, { poort: string; pad: string }> = {};
  const lines = inhoud.split("\n");
  for (const line of lines) {
    const match = line.match(/\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/);
    if (match && !match[1].includes("Project") && !match[1].includes("---")) {
      const naam = match[1].trim().replace(/\s*\(.*\)/, "");
      servers[naam.toLowerCase()] = {
        poort: match[2].trim(),
        pad: match[4].trim(),
      };
    }
  }
  return servers;
}

function parseTakenUitBestand(inhoud: string): { open: number; afgerond: number } {
  let open = 0;
  let afgerond = 0;
  const regels = inhoud.split("\n");
  for (const regel of regels) {
    if (regel.match(/^[-*]\s*\[ \]\s+.+/)) open++;
    else if (regel.match(/^[-*]\s*\[x\]\s+.+/i)) afgerond++;
  }
  return { open, afgerond };
}

function parseProjectBestand(inhoud: string, bestandsnaam: string): ProjectInfo | null {
  const fm = parseFrontmatter(inhoud);

  let naam = fm.name || "";
  if (!naam) {
    const headingMatch = inhoud.match(/^#\s+(.+)/m);
    if (headingMatch) naam = headingMatch[1].trim();
  }
  if (!naam) {
    naam = bestandsnaam
      .replace(/^project_/, "")
      .replace(/\.md$/, "")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const beschrijving = fm.description || "";

  let liveUrl = extractField(inhoud, /Live:\s*`?(https?:\/\/[^\s`]+)/i);
  if (!liveUrl) liveUrl = extractField(inhoud, /\*\*Vercel:\*\*\s*(https?:\/\/[^\s]+)/i);
  if (!liveUrl) {
    const vercelMatch = inhoud.match(/https?:\/\/[\w-]+\.vercel\.app/);
    if (vercelMatch) liveUrl = vercelMatch[0];
  }

  const liveDomein = extractDomein(liveUrl);

  const pad = extractField(inhoud, /Pad:\s*`?(\/[^\s`]+)/i);

  let github = extractField(inhoud, /GitHub:\s*`?([^\s`]+)/i);
  if (github && !github.startsWith("http")) {
    github = "https://github.com/" + github;
  }

  return { naam, beschrijving, devServer: null, liveUrl, liveDomein, pad, github, openTaken: 0, afgerondeTaken: 0 };
}

export async function GET() {
  const projecten: ProjectInfo[] = [];

  try {
    let devServers: Record<string, { poort: string; pad: string }> = {};
    try {
      const devContent = await fs.readFile(path.join(MEMORY_PATH, DEV_SERVERS_FILE), "utf-8");
      devServers = parseDevServers(devContent);
    } catch {
      // geen dev servers bestand
    }

    // Lees taken bestanden voor counts
    const takenCounts: Record<string, { open: number; afgerond: number }> = {};
    try {
      const alleBestanden = await fs.readdir(MEMORY_PATH);
      const takenBestanden = alleBestanden.filter((b) => b.endsWith("_taken.md"));
      for (const bestand of takenBestanden) {
        try {
          const inhoud = await fs.readFile(path.join(MEMORY_PATH, bestand), "utf-8");
          const counts = parseTakenUitBestand(inhoud);
          const projectKey = bestand.replace(/_taken\.md$/, "").replace(/[-_]/g, " ").toLowerCase();
          takenCounts[projectKey] = counts;
        } catch {
          continue;
        }
      }
    } catch {
      // geen taken bestanden
    }

    const bestanden = await fs.readdir(MEMORY_PATH);
    const projectBestanden = bestanden.filter((b) => b.startsWith("project_") && b.endsWith(".md"));

    for (const bestand of projectBestanden) {
      try {
        const inhoud = await fs.readFile(path.join(MEMORY_PATH, bestand), "utf-8");
        const project = parseProjectBestand(inhoud, bestand);
        if (project) {
          // Match dev server
          const naamLower = project.naam.toLowerCase();
          for (const [key, val] of Object.entries(devServers)) {
            if (naamLower.includes(key) || key.includes(naamLower) ||
                naamLower.split(" ").some(w => key.includes(w) && w.length > 3)) {
              project.devServer = "http://localhost:" + val.poort;
              break;
            }
          }

          if (!project.devServer) {
            const poortMatch = inhoud.match(/(?:Dev server|poort)[:\s]*\*?\*?(\d{4})/i);
            if (poortMatch) {
              project.devServer = "http://localhost:" + poortMatch[1];
            }
          }

          // Match taken counts
          for (const [key, counts] of Object.entries(takenCounts)) {
            if (naamLower.includes(key) || key.includes(naamLower) ||
                naamLower.split(" ").some(w => key.includes(w) && w.length > 3)) {
              project.openTaken = counts.open;
              project.afgerondeTaken = counts.afgerond;
              break;
            }
          }

          projecten.push(project);
        }
      } catch {
        continue;
      }
    }

    projecten.sort((a, b) => a.naam.localeCompare(b.naam));

    return NextResponse.json({ projecten });
  } catch (error) {
    console.error("Projecten leesfout:", error);
    return NextResponse.json({ projecten: [] });
  }
}
