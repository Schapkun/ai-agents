export type Agent = {
  id: string;
  naam: string;
  beschrijving: string;
  kleur: string;
  bgKleur: string;
  borderKleur: string;
  accentHex: string;
  gebruikt: number;
  geslaagd: number;
  trend: "up" | "down" | "stable";
};

export const agents: Agent[] = [
  {
    id: "feature-agent",
    naam: "Feature Agent",
    beschrijving: "Bouw een volledig nieuwe functionaliteit van ontwerp tot oplevering",
    kleur: "text-violet-400",
    bgKleur: "bg-violet-400/10",
    borderKleur: "border-violet-400/20",
    accentHex: "#a78bfa",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
  },
  {
    id: "fix-agent",
    naam: "Fix Agent",
    beschrijving: "Diagnose en oplossing van bugs, fouten en onverwacht gedrag",
    kleur: "text-orange-400",
    bgKleur: "bg-orange-400/10",
    borderKleur: "border-orange-400/20",
    accentHex: "#fb923c",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
  },
  {
    id: "design-agent",
    naam: "Design Agent",
    beschrijving: "UI/UX aanpassingen, visuele verbeteringen en layout wijzigingen",
    kleur: "text-pink-400",
    bgKleur: "bg-pink-400/10",
    borderKleur: "border-pink-400/20",
    accentHex: "#f472b6",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
  },
  {
    id: "refactor-agent",
    naam: "Refactor Agent",
    beschrijving: "Code herstructureren voor betere leesbaarheid en onderhoudbaarheid",
    kleur: "text-cyan-400",
    bgKleur: "bg-cyan-400/10",
    borderKleur: "border-cyan-400/20",
    accentHex: "#22d3ee",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
  },
  {
    id: "setup-agent",
    naam: "Setup Agent",
    beschrijving: "Nieuw project initialiseren met tooling, configuratie en structuur",
    kleur: "text-teal-400",
    bgKleur: "bg-teal-400/10",
    borderKleur: "border-teal-400/20",
    accentHex: "#2dd4bf",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
  },
];

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export type AgentData = Agent;

export function agentToData(agent: Agent): AgentData {
  return { ...agent };
}

export function slagingspercentage(agent: Agent): number | null {
  if (agent.gebruikt === 0) return null;
  return Math.round((agent.geslaagd / agent.gebruikt) * 100);
}
