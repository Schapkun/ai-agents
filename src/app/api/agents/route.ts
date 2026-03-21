import { NextResponse } from "next/server";
import { agents } from "@/lib/agents";

export async function GET() {
  const data = agents.map((agent) => ({
    id: agent.id,
    naam: agent.naam,
    beschrijving: agent.beschrijving,
    kleur: agent.kleur,
    bgKleur: agent.bgKleur,
    borderKleur: agent.borderKleur,
    accentHex: agent.accentHex,
    gebruikt: agent.gebruikt,
    geslaagd: agent.geslaagd,
    trend: agent.trend,
    laatsteActiviteit: agent.laatsteActiviteit,
  }));
  return NextResponse.json({ agents: data });
}
