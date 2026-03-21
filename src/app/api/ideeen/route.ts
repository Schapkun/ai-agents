import { NextResponse } from "next/server";
import fs from "fs/promises";

const IDEEEN_PATH = process.env.IDEEEN_PATH || "/Users/doerak/.claude/projects/-Users-doerak/memory/ideeen.md";

type Idee = {
  titel: string;
  beschrijving: string;
  status: string;
  datum: string;
  url: string | null;
};

function parseIdeeen(inhoud: string): Idee[] {
  const ideeen: Idee[] = [];
  const secties = inhoud.split(/^## \d+\.\s+/m).filter((s) => s.trim());

  for (const sectie of secties) {
    const regels = sectie.split("\n");
    const titel = regels[0]?.trim() || "Onbekend";

    let beschrijving = "";
    let status = "nieuw";
    let datum = "";
    let url: string | null = null;

    for (const regel of regels) {
      const statusMatch = regel.match(/\*\*Status:\*\*\s*(.+)/);
      const datumMatch = regel.match(/\*\*Datum:\*\*\s*(.+)/);
      const urlMatch = regel.match(/\*\*URL:\*\*\s*(.+)/);
      const notitiesMatch = regel.match(/\*\*Notities:\*\*\s*(.+)/);
      const prioriteitMatch = regel.match(/\*\*Prioriteit:\*\*\s*(.+)/);

      if (statusMatch) status = statusMatch[1].trim();
      if (datumMatch) datum = datumMatch[1].trim();
      if (urlMatch) {
        const urlVal = urlMatch[1].trim();
        url = urlVal === "-" ? null : urlVal;
      }
      if (notitiesMatch) beschrijving = notitiesMatch[1].trim();
      if (prioriteitMatch && !beschrijving) {
        beschrijving = prioriteitMatch[1].trim();
      }
    }

    const conceptMatch = sectie.match(/### Concept\n([\s\S]*?)(?=\n###|$)/);
    if (conceptMatch) {
      beschrijving = conceptMatch[1].trim().split("\n")[0] || beschrijving;
    }

    if (titel && titel !== "Onbekend") {
      ideeen.push({ titel, beschrijving, status, datum, url });
    }
  }

  return ideeen;
}

export async function GET() {
  try {
    const inhoud = await fs.readFile(IDEEEN_PATH, "utf-8");
    const ideeen = parseIdeeen(inhoud);
    return NextResponse.json({ ideeen });
  } catch (error) {
    console.error("Ideeen leesfout:", error);
    return NextResponse.json({ ideeen: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titel, actie, nieuweTitel, nieuweBeschrijving, tekst } = body as {
      titel: string;
      actie: "uitwerken" | "bewerken" | "feedback";
      nieuweTitel?: string;
      nieuweBeschrijving?: string;
      tekst?: string;
    };

    if (!titel || !actie) {
      return NextResponse.json({ error: "titel en actie zijn verplicht" }, { status: 400 });
    }

    let inhoud = await fs.readFile(IDEEEN_PATH, "utf-8");

    // Zoek de sectie met deze titel
    const sectieRegex = new RegExp(`(## \\d+\\.\\s+${escapeRegex(titel)}[\\s\\S]*?)(?=\\n## \\d+\\.|\$)`, "m");
    const match = inhoud.match(sectieRegex);

    if (!match) {
      return NextResponse.json({ error: `Idee niet gevonden: ${titel}` }, { status: 404 });
    }

    const oudeSecite = match[1];
    let nieuweSecite = oudeSecite;

    switch (actie) {
      case "uitwerken":
        // Verander status van "nieuw" naar "uitgewerkt concept"
        nieuweSecite = nieuweSecite.replace(
          /\*\*Status:\*\*\s*.+/,
          "**Status:** uitgewerkt concept"
        );
        break;

      case "bewerken":
        if (nieuweTitel) {
          // Vervang de titel in de header
          nieuweSecite = nieuweSecite.replace(
            /^(## \d+\.\s+).+/m,
            `$1${nieuweTitel}`
          );
        }
        if (nieuweBeschrijving) {
          if (nieuweSecite.includes("**Notities:**")) {
            nieuweSecite = nieuweSecite.replace(
              /\*\*Notities:\*\*\s*.+/,
              `**Notities:** ${nieuweBeschrijving}`
            );
          } else {
            // Voeg notities toe na de datum regel
            nieuweSecite = nieuweSecite.replace(
              /(\*\*Datum:\*\*\s*.+)/,
              `$1\n- **Notities:** ${nieuweBeschrijving}`
            );
          }
        }
        break;

      case "feedback":
        if (!tekst) {
          return NextResponse.json({ error: "tekst is verplicht bij feedback" }, { status: 400 });
        }
        // Voeg feedback sectie toe
        const feedbackDatum = new Date().toISOString().split("T")[0];
        nieuweSecite = nieuweSecite.trimEnd() + `\n\n### Feedback (${feedbackDatum})\n${tekst}\n`;
        break;
    }

    inhoud = inhoud.replace(oudeSecite, nieuweSecite);
    await fs.writeFile(IDEEEN_PATH, inhoud, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ideeen schrijffout:", error);
    return NextResponse.json({ error: "Interne fout bij verwerken idee" }, { status: 500 });
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\\$&");
}
