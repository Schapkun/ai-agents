import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { LOGBOEK_PATH } from "@/lib/config";

const LOGBOEK_BASE = LOGBOEK_PATH;

type LogboekEntry = {
  datum: string;
  inhoud: string;
  categorie: string;
};

export async function GET() {
  const entries: LogboekEntry[] = [];

  try {
    const items = await fs.readdir(LOGBOEK_BASE);

    for (const item of items) {
      const itemPath = path.join(LOGBOEK_BASE, item);

      let stat;
      try {
        stat = await fs.stat(itemPath);
      } catch {
        continue;
      }

      if (stat.isDirectory() && /^\d{4}$/.test(item)) {
        let maanden: string[];
        try {
          maanden = await fs.readdir(itemPath);
        } catch {
          continue;
        }

        for (const maand of maanden) {
          const maandPath = path.join(itemPath, maand);

          let maandStat;
          try {
            maandStat = await fs.stat(maandPath);
          } catch {
            continue;
          }

          if (!maandStat.isDirectory()) continue;

          let bestanden: string[];
          try {
            bestanden = await fs.readdir(maandPath);
          } catch {
            continue;
          }

          for (const bestand of bestanden) {
            if (!bestand.endsWith(".md")) continue;

            try {
              const inhoud = await fs.readFile(
                path.join(maandPath, bestand),
                "utf-8"
              );
              const datum = bestand.replace(".md", "");
              entries.push({ datum, inhoud, categorie: "dagelijks" });
            } catch {
              continue;
            }
          }
        }
      }
    }

    entries.sort((a, b) => b.datum.localeCompare(a.datum));

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Logboek leesfout:", error);
    return NextResponse.json(
      { error: "Kon logboek niet lezen" },
      { status: 500 }
    );
  }
}
