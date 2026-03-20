"use client";

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
  MessageSquare,
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type AgentInfo = {
  id: string;
  naam: string;
  beschrijving: string;
  icon: LucideIcon;
  kleur: string;
  bgKleur: string;
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

const agentData: AgentInfo[] = [
  { id: "michael", naam: "Michael Agent", beschrijving: "Michaels perspectief, controleert Manager", icon: User, kleur: "text-amber-400", bgKleur: "bg-amber-400/10", level: 5, levelNaam: levelNaam(5), status: "online", trend: "stable" },
  { id: "manager", naam: "Manager (Mattie)", beschrijving: "Technisch leider, delegeert en controleert", icon: Bot, kleur: "text-blue-400", bgKleur: "bg-blue-400/10", level: 33, levelNaam: levelNaam(33), status: "online", trend: "up" },
  { id: "code", naam: "Code Agent", beschrijving: "Schrijft en genereert code", icon: Code, kleur: "text-violet-400", bgKleur: "bg-violet-400/10", level: 50, levelNaam: levelNaam(50), status: "online", trend: "stable" },
  { id: "review", naam: "Review Agent", beschrijving: "Controleert code kwaliteit", icon: CheckCircle, kleur: "text-green-400", bgKleur: "bg-green-400/10", level: 40, levelNaam: levelNaam(40), status: "online", trend: "stable" },
  { id: "design", naam: "Design Agent", beschrijving: "UI/UX design en visuele output", icon: Palette, kleur: "text-pink-400", bgKleur: "bg-pink-400/10", level: 15, levelNaam: levelNaam(15), status: "online", trend: "down" },
  { id: "fix", naam: "Fix Agent", beschrijving: "Lost bugs en problemen op", icon: Wrench, kleur: "text-orange-400", bgKleur: "bg-orange-400/10", level: 45, levelNaam: levelNaam(45), status: "online", trend: "up" },
  { id: "research", naam: "Research Agent", beschrijving: "Onderzoek, samenvattingen en analyses", icon: Search, kleur: "text-cyan-400", bgKleur: "bg-cyan-400/10", level: 55, levelNaam: levelNaam(55), status: "online", trend: "up" },
  { id: "setup", naam: "Setup Agent", beschrijving: "Project setup en configuratie", icon: Settings, kleur: "text-teal-400", bgKleur: "bg-teal-400/10", level: 50, levelNaam: levelNaam(50), status: "online", trend: "stable" },
  { id: "database", naam: "Database Agent", beschrijving: "Database ontwerp en queries", icon: Database, kleur: "text-indigo-400", bgKleur: "bg-indigo-400/10", level: 40, levelNaam: levelNaam(40), status: "online", trend: "stable" },
];

function LevelBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-24 rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
          style={{ width: `${level}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400 font-mono w-6 text-right">{level}</span>
    </div>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-zinc-500" />;
}

export default function AgentsPage() {
  const gemiddeldLevel = Math.round(agentData.reduce((sum, a) => sum + a.level, 0) / agentData.length);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-zinc-800/60 bg-zinc-900/40">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-white/10">
            <Bot className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">AI Agents</span>
            <p className="text-[10px] text-zinc-500">Dashboard</p>
          </div>
        </div>

        <nav className="px-3 pt-3 pb-1 space-y-0.5">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors">
            <MessageSquare className="h-4 w-4" />
            Chat
          </Link>
          <Link href="/agents" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white bg-zinc-800/60">
            <Users className="h-4 w-4 text-zinc-400" />
            Agents
          </Link>
          <Link href="/logboek" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors">
            <BookOpen className="h-4 w-4" />
            Logboek
          </Link>
        </nav>

        <div className="flex-1" />

        <div className="border-t border-zinc-800/60 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[10px] font-bold">M</div>
            <div>
              <p className="text-xs font-medium text-zinc-300">Michael</p>
              <p className="text-[10px] text-zinc-500">Eigenaar</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight">Agents</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {agentData.length} agents &middot; gemiddeld level {gemiddeldLevel}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/40 px-5 py-4">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Totaal agents</p>
              <p className="text-2xl font-semibold mt-1">{agentData.length}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/40 px-5 py-4">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Online</p>
              <p className="text-2xl font-semibold mt-1 text-emerald-400">{agentData.filter((a) => a.status === "online").length}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/40 px-5 py-4">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Gem. level</p>
              <p className="text-2xl font-semibold mt-1">{gemiddeldLevel}</p>
            </div>
          </div>

          {/* Tabel */}
          <div className="rounded-xl border border-zinc-800/40 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/40 bg-zinc-900/40">
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Agent</th>
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Level</th>
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Rang</th>
                  <th className="text-center px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody>
                {agentData.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <tr key={agent.id} className="border-b border-zinc-800/20 hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${agent.bgKleur}`}>
                            <Icon className={`h-4 w-4 ${agent.kleur}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{agent.naam}</p>
                            <p className="text-[11px] text-zinc-500">{agent.beschrijving}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <LevelBar level={agent.level} />
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-zinc-400">{agent.levelNaam}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md ${
                          agent.status === "online"
                            ? "text-emerald-400 bg-emerald-400/10"
                            : "text-zinc-500 bg-zinc-800"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${agent.status === "online" ? "bg-emerald-400" : "bg-zinc-500"}`} />
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex justify-center">
                          <TrendIcon trend={agent.trend} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
