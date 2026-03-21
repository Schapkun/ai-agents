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
  pad: string | null;
  github: string | null;
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

function parseProjectBestand(inhoud: string, bestandsnaam: string): ProjectInfo | null {
  const fm = parseFrontmatter(inhoud);

  // Naam uit frontmatter name of eerste heading
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

  // Beschrijving uit frontmatter description
  const beschrijving = fm.description || "";

  // Live URL
  let liveUrl = extractField(inhoud, /Live:\s*`?(https?:\/\/[^\s`]+)/i);
  if (!liveUrl) liveUrl = extractField(inhoud, /\*\*Vercel:\*\*\s*(https?:\/\/[^\s]+)/i);

  // Pad
  const pad = extractField(inhoud, /Pad:\s*`?(\/[^\s`]+)/i);

  // GitHub
  let github = extractField(inhoud, /GitHub:\s*`?([^\s`]+)/i);
  if (github && !github.startsWith("http")) {
    github = "https://github.com/" + github;
  }

  return { naam, beschrijving, devServer: null, liveUrl, pad, github };
}

export async function GET() {
  const projecten: ProjectInfo[] = [];

  try {
    // Lees dev servers
    let devServers: Record<string, { poort: string; pad: string }> = {};
    try {
      const devContent = await fs.readFile(path.join(MEMORY_PATH, DEV_SERVERS_FILE), "utf-8");
      devServers = parseDevServers(devContent);
    } catch {
      // geen dev servers bestand
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

          // Extract dev server port from content if not matched
          if (!project.devServer) {
            const poortMatch = inhoud.match(/(?:Dev server|poort)[:\s]*\*?\*?(\d{4})/i);
            if (poortMatch) {
              project.devServer = "http://localhost:" + poortMatch[1];
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
