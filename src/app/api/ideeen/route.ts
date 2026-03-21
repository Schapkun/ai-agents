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

    // Als er een ### Concept sectie is, gebruik die als beschrijving
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
