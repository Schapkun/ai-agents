import {
  User,
  Bot,
  Code,
  CheckCircle,
  Palette,
  Wrench,
  Search,
  Settings,
  Database,
  type LucideIcon,
} from "lucide-react";

export type Agent = {
  id: string;
  naam: string;
  beschrijving: string;
  uitleg: string;
  icon: LucideIcon;
  kleur: string;
  bgKleur: string;
  borderKleur: string;
  accentHex: string;
  level: number;
  levelNaam: string;
  status: "online" | "offline";
  trend: "up" | "down" | "stable";
};

function levelNaam(level: number): string {
  if (level <= 20) return "Beginner";
  if (level <= 40) return "Junior";
  if (level <= 60) return "Medior";
  if (level <= 80) return "Senior";
  return "Expert";
}

export const agents: Agent[] = [
  {
    id: "michael",
    naam: "Michael Agent",
    beschrijving: "Michaels perspectief, controleert Manager",
    uitleg: "Ik vertegenwoordig Michael. Ik controleer of alles klopt en of het team de juiste richting opgaat.",
    icon: User,
    kleur: "text-amber-400",
    bgKleur: "bg-amber-400/10",
    borderKleur: "border-amber-400/20",
    accentHex: "#fbbf24",
    level: 5,
    levelNaam: levelNaam(5),
    status: "online",
    trend: "stable",
  },
  {
    id: "manager",
    naam: "Manager (Mattie)",
    beschrijving: "Technisch leider, delegeert en controleert",
    uitleg: "Ik ben Mattie, de manager. Ik coordineer het team, delegeer taken en controleer de kwaliteit van het werk.",
    icon: Bot,
    kleur: "text-blue-400",
    bgKleur: "bg-blue-400/10",
    borderKleur: "border-blue-400/20",
    accentHex: "#60a5fa",
    level: 33,
    levelNaam: levelNaam(33),
    status: "online",
    trend: "up",
  },
  {
    id: "code",
    naam: "Code Agent",
    beschrijving: "Schrijft en genereert code",
    uitleg: "Ik schrijf code. React, TypeScript, Tailwind, Next.js — beschrijf wat je wilt en ik bouw het.",
    icon: Code,
    kleur: "text-violet-400",
    bgKleur: "bg-violet-400/10",
    borderKleur: "border-violet-400/20",
    accentHex: "#a78bfa",
    level: 50,
    levelNaam: levelNaam(50),
    status: "online",
    trend: "stable",
  },
  {
    id: "review",
    naam: "Review Agent",
    beschrijving: "Controleert code kwaliteit",
    uitleg: "Ik review code op kwaliteit, bugs en best practices. Stuur me code en ik geef feedback.",
    icon: CheckCircle,
    kleur: "text-green-400",
    bgKleur: "bg-green-400/10",
    borderKleur: "border-green-400/20",
    accentHex: "#4ade80",
    level: 40,
    levelNaam: levelNaam(40),
    status: "online",
    trend: "stable",
  },
  {
    id: "design",
    naam: "Design Agent",
    beschrijving: "UI/UX design en visuele output",
    uitleg: "Ik help met design beslissingen, kleurpaletten, layouts en visuele verbeteringen.",
    icon: Palette,
    kleur: "text-pink-400",
    bgKleur: "bg-pink-400/10",
    borderKleur: "border-pink-400/20",
    accentHex: "#f472b6",
    level: 15,
    levelNaam: levelNaam(15),
    status: "online",
    trend: "down",
  },
  {
    id: "fix",
    naam: "Fix Agent",
    beschrijving: "Lost bugs en problemen op",
    uitleg: "Ik los bugs op. Stuur me een foutmelding of beschrijf het probleem, en ik vind de oorzaak.",
    icon: Wrench,
    kleur: "text-orange-400",
    bgKleur: "bg-orange-400/10",
    borderKleur: "border-orange-400/20",
    accentHex: "#fb923c",
    level: 45,
    levelNaam: levelNaam(45),
    status: "online",
    trend: "up",
  },
  {
    id: "research",
    naam: "Research Agent",
    beschrijving: "Onderzoek, samenvattingen en analyses",
    uitleg: "Ik doe onderzoek. Geef me een onderwerp en ik lever een gestructureerde analyse.",
    icon: Search,
    kleur: "text-cyan-400",
    bgKleur: "bg-cyan-400/10",
    borderKleur: "border-cyan-400/20",
    accentHex: "#22d3ee",
    level: 55,
    levelNaam: levelNaam(55),
    status: "online",
    trend: "up",
  },
  {
    id: "setup",
    naam: "Setup Agent",
    beschrijving: "Project setup en configuratie",
    uitleg: "Ik zet projecten op. Van Next.js tot databases — ik configureer alles.",
    icon: Settings,
    kleur: "text-teal-400",
    bgKleur: "bg-teal-400/10",
    borderKleur: "border-teal-400/20",
    accentHex: "#2dd4bf",
    level: 50,
    levelNaam: levelNaam(50),
    status: "online",
    trend: "stable",
  },
  {
    id: "database",
    naam: "Database Agent",
    beschrijving: "Database ontwerp en queries",
    uitleg: "Ik help met databases. Schema ontwerp, queries, migraties — alles rondom data.",
    icon: Database,
    kleur: "text-indigo-400",
    bgKleur: "bg-indigo-400/10",
    borderKleur: "border-indigo-400/20",
    accentHex: "#818cf8",
    level: 40,
    levelNaam: levelNaam(40),
    status: "online",
    trend: "stable",
  },
];

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

// Serializable version for API responses (without icon component)
export type AgentData = Omit<Agent, "icon"> & { icon: string };

export function agentToData(agent: Agent): AgentData {
  const iconNames: Record<string, string> = {
    michael: "User",
    manager: "Bot",
    code: "Code",
    review: "CheckCircle",
    design: "Palette",
    fix: "Wrench",
    research: "Search",
    setup: "Settings",
    database: "Database",
  };
  return {
    ...agent,
    icon: iconNames[agent.id] || "Bot",
  };
}
