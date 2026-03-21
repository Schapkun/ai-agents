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

function vindTakenBestand(projectNaam: string, bestanden: string[]): string | null {
  const takenBestanden = bestanden.filter((b) => b.endsWith("_taken.md"));
  
  for (const bestand of takenBestanden) {
    const bestandNaam = parseProjectNaam(bestand).toLowerCase();
    if (bestandNaam === projectNaam.toLowerCase()) return bestand;
  }
  
  for (const bestand of takenBestanden) {
    const bestandNaam = parseProjectNaam(bestand).toLowerCase();
    if (bestandNaam.includes(projectNaam.toLowerCase()) || 
        projectNaam.toLowerCase().includes(bestandNaam)) return bestand;
  }
  
  for (const bestand of takenBestanden) {
    const bestandNaam = parseProjectNaam(bestand).toLowerCase();
    const projectWoorden = projectNaam.toLowerCase().split(" ");
    if (projectWoorden.some(w => w.length > 3 && bestandNaam.includes(w))) return bestand;
  }
  
  return null;
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project, taak, actie, nieuweTekst } = body as {
      project: string;
      taak: string;
      actie: "uitvoeren" | "annuleren" | "bewerken" | "heropenen";
      nieuweTekst?: string;
    };

    if (!project || !taak || !actie) {
      return NextResponse.json({ error: "project, taak en actie zijn verplicht" }, { status: 400 });
    }

    const bestanden = await fs.readdir(TAKEN_BASE);
    const bestand = vindTakenBestand(project, bestanden);

    if (!bestand) {
      return NextResponse.json({ error: `Geen taken bestand gevonden voor project: ${project}` }, { status: 404 });
    }

    const bestandPad = path.join(TAKEN_BASE, bestand);
    let inhoud = await fs.readFile(bestandPad, "utf-8");
    const regels = inhoud.split("\n");
    let gevonden = false;

    const taakTrimmed = taak.trim();

    for (let i = 0; i < regels.length; i++) {
      const regel = regels[i];
      const matchOpen = regel.match(/^([-*]\s*)\[ \]\s+(.+)/);
      const matchKlaar = regel.match(/^([-*]\s*)\[x\]\s+(.+)/i);
      
      const match = matchOpen || matchKlaar;
      if (!match) continue;
      
      const regelTekst = match[2].trim();
      if (regelTekst !== taakTrimmed) continue;

      gevonden = true;
      const prefix = match[1];

      switch (actie) {
        case "uitvoeren":
          regels[i] = `${prefix}[x] ${regelTekst}`;
          break;
        case "heropenen":
          regels[i] = `${prefix}[ ] ${regelTekst}`;
          break;
        case "annuleren":
          regels.splice(i, 1);
          break;
        case "bewerken":
          if (!nieuweTekst) {
            return NextResponse.json({ error: "nieuweTekst is verplicht bij bewerken" }, { status: 400 });
          }
          const isKlaar = !!matchKlaar;
          regels[i] = `${prefix}[${isKlaar ? "x" : " "}] ${nieuweTekst.trim()}`;
          break;
      }
      break;
    }

    if (!gevonden) {
      return NextResponse.json({ error: `Taak niet gevonden: ${taak}` }, { status: 404 });
    }

    await fs.writeFile(bestandPad, regels.join("\n"), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Taken schrijffout:", error);
    return NextResponse.json({ error: "Interne fout bij verwerken taak" }, { status: 500 });
  }
}
