import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MEMORY_PATH = process.env.MEMORY_PATH || "/Users/doerak/.claude/projects/-Users-doerak/memory/";
const LOGBOEK_PATH = process.env.LOGBOEK_PATH || "/Users/doerak/.claude/logboek";

const BEKENDE_INFO: Record<string, { dev?: string; live?: string; liveDomein?: string; github?: string }> = {
  "mijn project agents": { dev: "http://192.168.1.131:3000", live: "https://agents.schapkun.com", liveDomein: "agents.schapkun.com", github: "https://github.com/Schapkun/ai-agents" },
  "meester hendrik": { dev: "http://192.168.1.131:3006", live: "https://meester-hendrik.vercel.app", liveDomein: "meester-hendrik.vercel.app", github: "https://github.com/Schapkun/meester-hendrik" },
  "configurator": { dev: "http://192.168.1.131:3008", github: "https://github.com/Schapkun/configurator" },
  "factuur v1": { dev: "http://192.168.1.131:3001" },
  "stayops": { dev: "http://192.168.1.131:3007" },
  "mattie": {},
  "voortgang": { dev: "http://192.168.1.131:3000" },
};

type Taak = { tekst: string; klaar: boolean };

function parseTaken(inhoud: string): Taak[] {
  const taken: Taak[] = [];
  for (const regel of inhoud.split("\n")) {
    const matchOpen = regel.match(/^[-*]\s*\[ \]\s+(.+)/);
    const matchKlaar = regel.match(/^[-*]\s*\[x\]\s+(.+)/i);
    if (matchOpen) taken.push({ tekst: matchOpen[1].trim(), klaar: false });
    else if (matchKlaar) taken.push({ tekst: matchKlaar[1].trim(), klaar: true });
  }
  return taken;
}

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectNaam = decodeURIComponent(id);
  const naamLower = projectNaam.toLowerCase();

  try {
    // Zoek project bestand
    const bestanden = await fs.readdir(MEMORY_PATH);
    let projectInhoud = "";
    let projectBeschrijving = "";

    for (const b of bestanden.filter((f) => f.startsWith("project_") && f.endsWith(".md"))) {
      try {
        const inhoud = await fs.readFile(path.join(MEMORY_PATH, b), "utf-8");
        const fm = parseFrontmatter(inhoud);
        let naam = fm.name || "";
        if (!naam) {
          const h = inhoud.match(/^#\s+(.+)/m);
          naam = h ? h[1].trim() : "";
        }
        if (naam.toLowerCase() === naamLower ||
            naam.toLowerCase().includes(naamLower) ||
            naamLower.includes(naam.toLowerCase())) {
          projectInhoud = inhoud;
          projectBeschrijving = fm.description || "";
          break;
        }
      } catch { continue; }
    }

    // Zoek taken
    let taken: Taak[] = [];
    for (const b of bestanden.filter((f) => f.endsWith("_taken.md"))) {
      const key = b.replace(/_taken\.md$/, "").replace(/[-_]/g, " ").toLowerCase();
      if (naamLower.includes(key) || key.includes(naamLower) ||
          naamLower.split(" ").some(w => w.length > 3 && key.includes(w))) {
        try {
          const inhoud = await fs.readFile(path.join(MEMORY_PATH, b), "utf-8");
          taken = parseTaken(inhoud);
        } catch {}
        break;
      }
    }

    // Zoek bekende info
    const bekend = Object.entries(BEKENDE_INFO).find(([k]) =>
      naamLower.includes(k) || k.includes(naamLower) ||
      naamLower.split(" ").some(w => k.includes(w) && w.length > 3)
    );
    const info = bekend ? bekend[1] : {};

    // Zoek logboek entries
    const logboekEntries: { datum: string; inhoud: string }[] = [];
    try {
      const logDirs = await fs.readdir(LOGBOEK_PATH);
      const sortedDirs = logDirs.filter(d => d.match(/^\d{4}-\d{2}$/)).sort().reverse();
      
      for (const dir of sortedDirs.slice(0, 2)) {
        try {
          const files = await fs.readdir(path.join(LOGBOEK_PATH, dir));
          const mdFiles = files.filter(f => f.endsWith(".md")).sort().reverse();
          for (const file of mdFiles) {
            try {
              const inhoud = await fs.readFile(path.join(LOGBOEK_PATH, dir, file), "utf-8");
              if (inhoud.toLowerCase().includes(naamLower) ||
                  naamLower.split(" ").some(w => w.length > 3 && inhoud.toLowerCase().includes(w))) {
                const datum = file.replace(".md", "");
                const eersteRegel = inhoud.split("\n").find(r => r.trim() && !r.startsWith("#")) || datum;
                logboekEntries.push({ datum, inhoud: eersteRegel.replace(/^[-*]\s*/, "").trim() });
              }
            } catch { continue; }
          }
        } catch { continue; }
      }
    } catch {}

    return NextResponse.json({
      naam: projectNaam,
      beschrijving: projectBeschrijving,
      inhoud: projectInhoud,
      devServer: info.dev || null,
      liveUrl: info.live || null,
      liveDomein: info.liveDomein || null,
      github: info.github || null,
      taken,
      logboek: logboekEntries.slice(0, 10),
    });
  } catch {
    return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });
  }
}
