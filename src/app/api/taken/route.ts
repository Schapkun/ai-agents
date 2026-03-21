import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const TAKEN_BASE = process.env.TAKEN_PATH || "/Users/doerak/.claude/projects/-Users-doerak/memory/";

type Taak = {
  tekst: string;
  klaar: boolean;
};

type Project = {
  naam: string;
  taken: Taak[];
};

function parseProjectNaam(bestandsnaam: string): string {
  // ai-agency_taken.md -> Ai agency
  const naam = bestandsnaam
    .replace(/_taken\.md$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return naam;
}

function parseTaken(inhoud: string): Taak[] {
  const taken: Taak[] = [];
  const regels = inhoud.split("\n");

  for (const regel of regels) {
    const matchOpen = regel.match(/^[-*]\s*\[ \]\s+(.+)/);
    const matchKlaar = regel.match(/^[-*]\s*\[x\]\s+(.+)/i);

    if (matchOpen) {
      taken.push({ tekst: matchOpen[1].trim(), klaar: false });
    } else if (matchKlaar) {
      taken.push({ tekst: matchKlaar[1].trim(), klaar: true });
    }
  }

  return taken;
}

export async function GET() {
  const projects: Project[] = [];

  try {
    const bestanden = await fs.readdir(TAKEN_BASE);
    const takenBestanden = bestanden.filter((b) => b.endsWith("_taken.md"));

    for (const bestand of takenBestanden) {
      try {
        const inhoud = await fs.readFile(path.join(TAKEN_BASE, bestand), "utf-8");
        const taken = parseTaken(inhoud);
        if (taken.length > 0) {
          projects.push({
            naam: parseProjectNaam(bestand),
            taken,
          });
        }
      } catch {
        continue;
      }
    }

    // Sorteer: projecten met meer open taken eerst
    projects.sort((a, b) => {
      const openA = a.taken.filter((t) => !t.klaar).length;
      const openB = b.taken.filter((t) => !t.klaar).length;
      return openB - openA;
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Taken leesfout:", error);
    return NextResponse.json({ projects: [] });
  }
}
