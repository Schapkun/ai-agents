import {
  Code,
  Wrench,
  Palette,
  RefreshCw,
  FolderPlus,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type Agent = {
  id: string;
  naam: string;
  beschrijving: string;
  icon: LucideIcon;
  kleur: string;
  bgKleur: string;
  borderKleur: string;
  accentHex: string;
  gebruikt: number;
  geslaagd: number;
  trend: "up" | "down" | "stable";
  laatsteActiviteit: string;
};

export const agents: Agent[] = [
  {
    id: "feature-agent",
    naam: "Feature Agent",
    beschrijving: "Bouw een volledig nieuwe functionaliteit van ontwerp tot oplevering",
    icon: Code,
    kleur: "text-violet-400",
    bgKleur: "bg-violet-400/10",
    borderKleur: "border-violet-400/20",
    accentHex: "#a78bfa",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
    laatsteActiviteit: "-",
  },
  {
    id: "fix-agent",
    naam: "Fix Agent",
    beschrijving: "Diagnose en oplossing van bugs, fouten en onverwacht gedrag",
    icon: Wrench,
    kleur: "text-orange-400",
    bgKleur: "bg-orange-400/10",
    borderKleur: "border-orange-400/20",
    accentHex: "#fb923c",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
    laatsteActiviteit: "-",
  },
  {
    id: "design-agent",
    naam: "Design Agent",
    beschrijving: "UI/UX aanpassingen, visuele verbeteringen en layout wijzigingen",
    icon: Palette,
    kleur: "text-pink-400",
    bgKleur: "bg-pink-400/10",
    borderKleur: "border-pink-400/20",
    accentHex: "#f472b6",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
    laatsteActiviteit: "-",
  },
  {
    id: "refactor-agent",
    naam: "Refactor Agent",
    beschrijving: "Code herstructureren voor betere leesbaarheid en onderhoudbaarheid",
    icon: RefreshCw,
    kleur: "text-cyan-400",
    bgKleur: "bg-cyan-400/10",
    borderKleur: "border-cyan-400/20",
    accentHex: "#22d3ee",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
    laatsteActiviteit: "-",
  },
  {
    id: "setup-agent",
    naam: "Setup Agent",
    beschrijving: "Nieuw project initialiseren met tooling, configuratie en structuur",
    icon: FolderPlus,
    kleur: "text-teal-400",
    bgKleur: "bg-teal-400/10",
    borderKleur: "border-teal-400/20",
    accentHex: "#2dd4bf",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
    laatsteActiviteit: "-",
  },
  {
    id: "review",
    naam: "Review Agent",
    beschrijving: "Onafhankelijke controle van werk door andere agents",
    icon: Shield,
    kleur: "text-green-400",
    bgKleur: "bg-green-400/10",
    borderKleur: "border-green-400/20",
    accentHex: "#4ade80",
    gebruikt: 0,
    geslaagd: 0,
    trend: "stable",
    laatsteActiviteit: "-",
  },
];

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export function slagingspercentage(agent: Agent): number | null {
  if (agent.gebruikt === 0) return null;
  return Math.round((agent.geslaagd / agent.gebruikt) * 100);
}
