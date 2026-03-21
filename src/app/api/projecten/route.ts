import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MEMORY_PATH = process.env.MEMORY_PATH || "/Users/doerak/.claude/projects/-Users-doerak/memory/";

type ProjectInfo = {
  naam: string;
  beschrijving: string;
  status: string;
};

function parseProjectBestand(inhoud: string, bestandsnaam: string): ProjectInfo | null {
  const regels = inhoud.split("\n");

  // Probeer naam uit eerste heading te halen
  let naam = "";
  let beschrijving = "";
  let status = "Actief";

  for (const regel of regels) {
    if (!naam && regel.startsWith("# ")) {
      naam = regel.replace(/^#\s+/, "").trim();
    }
    if (regel.match(/\*\*Status:\*\*/i)) {
      const match = regel.match(/\*\*Status:\*\*\s*(.+)/i);
      if (match) status = match[1].trim();
    }
    if (regel.match(/\*\*Beschrijving:\*\*/i)) {
      const match = regel.match(/\*\*Beschrijving:\*\*\s*(.+)/i);
      if (match) beschrijving = match[1].trim();
    }
  }

  // Fallback naam uit bestandsnaam
  if (!naam) {
    naam = bestandsnaam
      .replace(/^project_/, "")
      .replace(/\.md$/, "")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Zoek beschrijving in eerste niet-lege, niet-heading regel als we er nog geen hebben
  if (!beschrijving) {
    for (const regel of regels) {
      const trimmed = regel.trim();
      if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("**") && !trimmed.startsWith("-")) {
        beschrijving = trimmed.slice(0, 100);
        break;
      }
    }
  }

  return { naam, beschrijving, status };
}

export async function GET() {
  const projecten: ProjectInfo[] = [];

  try {
    const bestanden = await fs.readdir(MEMORY_PATH);
    const projectBestanden = bestanden.filter((b) => b.startsWith("project_") && b.endsWith(".md"));

    for (const bestand of projectBestanden) {
      try {
        const inhoud = await fs.readFile(path.join(MEMORY_PATH, bestand), "utf-8");
        const project = parseProjectBestand(inhoud, bestand);
        if (project) {
          projecten.push(project);
        }
      } catch {
        continue;
      }
    }

    // Sorteer op naam
    projecten.sort((a, b) => a.naam.localeCompare(b.naam));

    return NextResponse.json({ projecten });
  } catch (error) {
    console.error("Projecten leesfout:", error);
    return NextResponse.json({ projecten: [] });
  }
}
