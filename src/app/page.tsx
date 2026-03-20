"use client";

import { useState, useRef, useEffect } from "react";
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
  Send,
  Trash2,
  Copy,
  Check,
  Plus,
  MessageSquare,
  Users,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";

type AgentConfig = {
  id: string;
  naam: string;
  beschrijving: string;
  uitleg: string;
  icon: LucideIcon;
  kleur: string;
  bgKleur: string;
  borderKleur: string;
  level: number;
  levelNaam: string;
};

const iconMap: Record<string, LucideIcon> = {
  michael: User,
  manager: Bot,
  code: Code,
  review: CheckCircle,
  design: Palette,
  fix: Wrench,
  research: Search,
  setup: Settings,
  database: Database,
};

function levelNaam(level: number): string {
  if (level <= 20) return "Beginner";
  if (level <= 40) return "Junior";
  if (level <= 60) return "Medior";
  if (level <= 80) return "Senior";
  return "Expert";
}

const agentConfigs: AgentConfig[] = [
  {
    id: "michael",
    naam: "Michael Agent",
    beschrijving: "Michaels perspectief",
    uitleg: "Ik vertegenwoordig Michael. Ik controleer of alles klopt en of het team de juiste richting opgaat.",
    icon: User,
    kleur: "text-amber-400",
    bgKleur: "bg-amber-400/10",
    borderKleur: "border-amber-400/20",
    level: 5,
    levelNaam: levelNaam(5),
  },
  {
    id: "manager",
    naam: "Mattie",
    beschrijving: "Manager & coordinator",
    uitleg: "Ik ben Mattie, de manager. Ik coordineer het team, delegeer taken en controleer de kwaliteit.",
    icon: Bot,
    kleur: "text-blue-400",
    bgKleur: "bg-blue-400/10",
    borderKleur: "border-blue-400/20",
    level: 33,
    levelNaam: levelNaam(33),
  },
  {
    id: "code",
    naam: "Code Agent",
    beschrijving: "Schrijft code",
    uitleg: "Ik schrijf code. React, TypeScript, Tailwind, Next.js — beschrijf wat je wilt en ik bouw het.",
    icon: Code,
    kleur: "text-violet-400",
    bgKleur: "bg-violet-400/10",
    borderKleur: "border-violet-400/20",
    level: 50,
    levelNaam: levelNaam(50),
  },
  {
    id: "review",
    naam: "Review Agent",
    beschrijving: "Code review",
    uitleg: "Ik review code op kwaliteit, bugs en best practices.",
    icon: CheckCircle,
    kleur: "text-green-400",
    bgKleur: "bg-green-400/10",
    borderKleur: "border-green-400/20",
    level: 40,
    levelNaam: levelNaam(40),
  },
  {
    id: "design",
    naam: "Design Agent",
    beschrijving: "UI/UX design",
    uitleg: "Ik help met design. Layouts, kleuren, typografie en visuele verbeteringen.",
    icon: Palette,
    kleur: "text-pink-400",
    bgKleur: "bg-pink-400/10",
    borderKleur: "border-pink-400/20",
    level: 15,
    levelNaam: levelNaam(15),
  },
  {
    id: "fix",
    naam: "Fix Agent",
    beschrijving: "Bugs oplossen",
    uitleg: "Ik los bugs op. Stuur me een foutmelding en ik vind de oorzaak.",
    icon: Wrench,
    kleur: "text-orange-400",
    bgKleur: "bg-orange-400/10",
    borderKleur: "border-orange-400/20",
    level: 45,
    levelNaam: levelNaam(45),
  },
  {
    id: "research",
    naam: "Research Agent",
    beschrijving: "Onderzoek & analyse",
    uitleg: "Ik doe onderzoek. Geef me een onderwerp en ik lever een gestructureerde analyse.",
    icon: Search,
    kleur: "text-cyan-400",
    bgKleur: "bg-cyan-400/10",
    borderKleur: "border-cyan-400/20",
    level: 55,
    levelNaam: levelNaam(55),
  },
  {
    id: "setup",
    naam: "Setup Agent",
    beschrijving: "Project configuratie",
    uitleg: "Ik zet projecten op. Van Next.js tot databases — ik configureer alles.",
    icon: Settings,
    kleur: "text-teal-400",
    bgKleur: "bg-teal-400/10",
    borderKleur: "border-teal-400/20",
    level: 50,
    levelNaam: levelNaam(50),
  },
  {
    id: "database",
    naam: "Database Agent",
    beschrijving: "Database & queries",
    uitleg: "Ik help met databases. Schema ontwerp, queries, migraties — alles rondom data.",
    icon: Database,
    kleur: "text-indigo-400",
    bgKleur: "bg-indigo-400/10",
    borderKleur: "border-indigo-400/20",
    level: 40,
    levelNaam: levelNaam(40),
  },
];

type Message = {
  rol: "user" | "agent";
  tekst: string;
};

type Gesprek = {
  id: string;
  agentId: string;
  titel: string;
  berichten: Message[];
  aangemaakt: number;
};

const STORAGE_KEY = "ai-agents-gesprekken-v2";

function laadGesprekken(): Gesprek[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function slaOp(gesprekken: Gesprek[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gesprekken));
}

export default function Home() {
  const [actieveAgent, setActieveAgent] = useState(agentConfigs[1]); // Default: Mattie
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [gesprekken, setGesprekken] = useState<Gesprek[]>([]);
  const [actiefGesprekId, setActiefGesprekId] = useState<string | null>(null);
  const [gekopieerd, setGekopieerd] = useState<number | null>(null);
  const [geladen, setGeladen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const opgeslagen = laadGesprekken();
    setGesprekken(opgeslagen);
    setGeladen(true);
  }, []);

  useEffect(() => {
    if (geladen) slaOp(gesprekken);
  }, [gesprekken, geladen]);

  function kopieer(tekst: string, index: number) {
    navigator.clipboard.writeText(tekst);
    setGekopieerd(index);
    setTimeout(() => setGekopieerd(null), 2000);
  }

  const actiefGesprek = gesprekken.find((g) => g.id === actiefGesprekId) || null;
  const berichten = actiefGesprek?.berichten || [];
  const agentGesprekken = gesprekken
    .filter((g) => g.agentId === actieveAgent.id)
    .sort((a, b) => b.aangemaakt - a.aangemaakt);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [actieveAgent.id]);

  function nieuwGesprek() {
    setActiefGesprekId(null);
  }

  function wisGesprek() {
    if (!actiefGesprekId) return;
    setGesprekken((prev) => prev.filter((g) => g.id !== actiefGesprekId));
    setActiefGesprekId(null);
  }

  async function verstuur() {
    if (!input.trim() || loading) return;

    const vraag = input;
    setInput("");

    let gesprekId = actiefGesprekId;

    if (!gesprekId) {
      gesprekId = crypto.randomUUID();
      const nieuw: Gesprek = {
        id: gesprekId,
        agentId: actieveAgent.id,
        titel: vraag.slice(0, 50) + (vraag.length > 50 ? "..." : ""),
        berichten: [{ rol: "user", tekst: vraag }],
        aangemaakt: Date.now(),
      };
      setGesprekken((prev) => [nieuw, ...prev]);
      setActiefGesprekId(gesprekId);
    } else {
      setGesprekken((prev) =>
        prev.map((g) =>
          g.id === gesprekId
            ? { ...g, berichten: [...g.berichten, { rol: "user", tekst: vraag }] }
            : g
        )
      );
    }

    setLoading(true);

    const huidigeBerichten = actiefGesprek?.berichten || [];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: actieveAgent.id,
          bericht: vraag,
          geschiedenis: huidigeBerichten,
        }),
      });
      const data = await res.json();

      setGesprekken((prev) =>
        prev.map((g) =>
          g.id === gesprekId
            ? { ...g, berichten: [...g.berichten, { rol: "agent", tekst: data.antwoord }] }
            : g
        )
      );
    } catch {
      setGesprekken((prev) =>
        prev.map((g) =>
          g.id === gesprekId
            ? { ...g, berichten: [...g.berichten, { rol: "agent", tekst: "Er ging iets mis. Probeer opnieuw." }] }
            : g
        )
      );
    }

    setLoading(false);
  }

  const AgentIcon = actieveAgent.icon;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-zinc-800/60 bg-zinc-900/40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-white/10">
            <Bot className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">AI Agents</span>
            <p className="text-[10px] text-zinc-500">Dashboard</p>
          </div>
        </div>

        {/* Navigatie */}
        <nav className="px-3 pt-3 pb-1 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white bg-zinc-800/60"
          >
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            Chat
          </Link>
          <Link
            href="/agents"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
          >
            <Users className="h-4 w-4" />
            Agents
          </Link>
          <Link
            href="/logboek"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Logboek
          </Link>
        </nav>

        <div className="px-3 pt-3">
          <p className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Agents
          </p>
        </div>

        {/* Agent lijst */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
          {agentConfigs.map((agent) => {
            const isActief = actieveAgent.id === agent.id;
            const Icon = agent.icon;
            const aantalGesprekken = gesprekken.filter((g) => g.agentId === agent.id).length;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setActieveAgent(agent);
                  setActiefGesprekId(null);
                }}
                className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-150 ${
                  isActief
                    ? "bg-zinc-800/70 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${agent.bgKleur}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${agent.kleur}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{agent.naam}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{agent.beschrijving}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {aantalGesprekken > 0 && (
                    <span className="text-[10px] text-zinc-600">{aantalGesprekken}</span>
                  )}
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                </div>
              </button>
            );
          })}

          {/* Gesprekken voor actieve agent */}
          {agentGesprekken.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between px-3 pb-1.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Gesprekken
                </p>
                <button
                  onClick={nieuwGesprek}
                  className="flex items-center gap-0.5 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {agentGesprekken.slice(0, 5).map((gesprek) => (
                <button
                  key={gesprek.id}
                  onClick={() => setActiefGesprekId(gesprek.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left transition-all ${
                    actiefGesprekId === gesprek.id
                      ? "bg-zinc-800/50 text-zinc-300"
                      : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-400"
                  }`}
                >
                  <MessageSquare className="h-3 w-3 shrink-0" />
                  <span className="text-[11px] truncate">{gesprek.titel}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="border-t border-zinc-800/60 px-4 py-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Online</span>
            <span className="text-emerald-400 font-medium">9/9</span>
          </div>
        </div>

        {/* User */}
        <div className="border-t border-zinc-800/60 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[10px] font-bold">
              M
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-300">Michael</p>
              <p className="text-[10px] text-zinc-500">Eigenaar</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-zinc-800/60 px-6 py-3 bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${actieveAgent.bgKleur} ring-1 ${actieveAgent.borderKleur}`}>
            <AgentIcon className={`h-4 w-4 ${actieveAgent.kleur}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold">{actieveAgent.naam}</h1>
              <span className="text-[10px] text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                Lv.{actieveAgent.level} {actieveAgent.levelNaam}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">{actieveAgent.beschrijving}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {berichten.length > 0 && (
              <button
                onClick={wisGesprek}
                className="flex items-center justify-center rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={nieuwGesprek}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Nieuw
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="mx-auto max-w-2xl px-6 py-6 space-y-6">
            {berichten.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${actieveAgent.bgKleur} ring-1 ${actieveAgent.borderKleur} mb-4`}>
                  <AgentIcon className={`h-7 w-7 ${actieveAgent.kleur}`} />
                </div>
                <h2 className="text-base font-semibold text-zinc-200">{actieveAgent.naam}</h2>
                <p className="mt-1.5 text-sm text-zinc-500 max-w-sm leading-relaxed">{actieveAgent.uitleg}</p>
              </div>
            )}

            {berichten.map((bericht, i) => (
              <div
                key={i}
                className={`group/msg flex gap-3 ${bericht.rol === "user" ? "justify-end" : "justify-start"}`}
              >
                {bericht.rol === "agent" && (
                  <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${actieveAgent.bgKleur}`}>
                    <AgentIcon className={`h-3.5 w-3.5 ${actieveAgent.kleur}`} />
                  </div>
                )}
                <div className="relative max-w-lg">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      bericht.rol === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-zinc-800/70 text-zinc-200 rounded-bl-md ring-1 ring-zinc-700/40"
                    }`}
                  >
                    {bericht.rol === "user" ? (
                      <p className="whitespace-pre-wrap break-words">{bericht.tekst}</p>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none break-words prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || "");
                              const codeString = String(children).replace(/\n$/, "");
                              if (match) {
                                return (
                                  <div className="relative my-2 rounded-lg overflow-hidden ring-1 ring-zinc-700/40">
                                    <div className="flex items-center justify-between px-3 py-1 bg-zinc-900/80 border-b border-zinc-700/40">
                                      <span className="text-[10px] text-zinc-500">{match[1]}</span>
                                      <button
                                        onClick={() => kopieer(codeString, i * 1000 + 1)}
                                        className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                                      >
                                        {gekopieerd === i * 1000 + 1 ? (
                                          <><Check className="h-3 w-3" /> Gekopieerd</>
                                        ) : (
                                          <><Copy className="h-3 w-3" /> Kopieer</>
                                        )}
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      style={oneDark}
                                      language={match[1]}
                                      PreTag="div"
                                      customStyle={{ margin: 0, background: "rgb(39 39 42 / 0.7)", fontSize: "12px" }}
                                    >
                                      {codeString}
                                    </SyntaxHighlighter>
                                  </div>
                                );
                              }
                              return (
                                <code className="rounded bg-zinc-700/40 px-1.5 py-0.5 text-xs text-zinc-300" {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => kopieer(bericht.tekst, i)}
                    className="absolute -bottom-5 right-1 flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 opacity-0 group-hover/msg:opacity-100 transition-opacity"
                  >
                    {gekopieerd === i ? (
                      <><Check className="h-3 w-3" /> Gekopieerd</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Kopieer</>
                    )}
                  </button>
                </div>
                {bericht.rol === "user" && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[10px] font-bold">
                    M
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${actieveAgent.bgKleur}`}>
                  <AgentIcon className={`h-3.5 w-3.5 ${actieveAgent.kleur}`} />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-zinc-800/70 ring-1 ring-zinc-700/40 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-duration:0.6s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.15s] [animation-duration:0.6s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.3s] [animation-duration:0.6s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800/60 px-6 py-3 bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); verstuur(); }}
            className="mx-auto flex max-w-2xl items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Bericht aan ${actieveAgent.naam}...`}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:opacity-30 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
