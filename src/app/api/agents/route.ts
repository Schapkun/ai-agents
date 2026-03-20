import { NextResponse } from "next/server";
import { agents, agentToData } from "@/lib/agents";

export async function GET() {
  const data = agents.map(agentToData);
  return NextResponse.json({ agents: data });
}
