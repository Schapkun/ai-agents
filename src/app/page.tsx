"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Code,
  Hammer,
  Send,
  Bot,
  Trash2,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const agents = [
  {
    id: "assistent",
    naam: "Assistent",
    beschrijving: "Algemene vragen, planning & coördinatie",
    uitleg:
      "Ik ben je persoonlijke assistent. Stel me een vraag, en ik help je verder — of verwijs je naar de juiste agent.",
    icon: MessageSquare,
    kleur: "text-emerald-400",
    bgKleur: "bg-emerald-400/10",
    borderKleur: "border-emerald-400/20",
    actief: true,
  },
  {
    id: "research",
    naam: "Research",
    beschrijving: "Onderzoek, samenvattingen & analyses",
    uitleg:
      "Ik help met diepgaand onderzoek, samenvattingen en gestructureerde analyses van elk onderwerp.",
    icon: Search,
    kleur: "text-blue-400",
    bgKleur: "bg-blue-400/10",
    borderKleur: "border-blue-400/20",
    actief: true,
  },
  {
    id: "code",
    naam: "Code Assistent",
    beschrijving: "Lovable prompts, debugging & web dev",
    uitleg:
      "Ik genereer Lovable prompts, help met debugging en geef advies over React, TypeScript en Tailwind.",
    icon: Code,
    kleur: "text-violet-400",
    bgKleur: "bg-violet-400/10",
    borderKleur: "border-violet-400/20",
    actief: true,
  },
  {
    id: "build",
    naam: "Code Builder",
    beschrijving: "Code genereren & deployen",
    uitleg: "Ik genereer complete, werkende code. Beschrijf wat je wilt bouwen en ik lever kant-en-klare componenten.",
    icon: Hammer,
    kleur: "text-amber-400",
    bgKleur: "bg-amber-400/10",
    borderKleur: "border-amber-400/20",
    actief: true,
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

const STORAGE_KEY = "ai-agents-gesprekken";

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
  const [actieveAgent, setActieveAgent] = useState(agents[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [gesprekken, setGesprekken] = useState<Gesprek[]>([]);
  const [actiefGesprekId, setActiefGesprekId] = useState<string | null>(null);
  const [gekopieerd, setGekopieerd] = useState<number | null>(null);
  const [geladen, setGeladen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Laad gesprekken uit localStorage bij eerste render
  useEffect(() => {
    const opgeslagen = laadGesprekken();
    setGesprekken(opgeslagen);
    setGeladen(true);
  }, []);

  // Sla op bij elke wijziging
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

  // Auto-scroll naar beneden bij nieuwe berichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten, loading]);

  // Focus input bij agent switch
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
      // Maak nieuw gesprek aan
      gesprekId = crypto.randomUUID();
      const nieuwGesprek: Gesprek = {
        id: gesprekId,
        agentId: actieveAgent.id,
        titel: vraag.slice(0, 50) + (vraag.length > 50 ? "..." : ""),
        berichten: [{ rol: "user", tekst: vraag }],
        aangemaakt: Date.now(),
      };
      setGesprekken((prev) => [nieuwGesprek, ...prev]);
      setActiefGesprekId(gesprekId);
    } else {
      // Voeg toe aan bestaand gesprek
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

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-72 flex-col border-r border-zinc-800/80 bg-zinc-900/50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-white/10">
            <Bot className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight">
              AI Agents
            </span>
            <p className="text-[11px] text-zinc-500">Michael&apos;s dashboard</p>
          </div>
        </div>

        {/* Agent lijst + gesprekken */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Agents
          </p>
          {agents.map((agent) => {
            const isActief = actieveAgent.id === agent.id;
            const aantalGesprekken = gesprekken.filter((g) => g.agentId === agent.id).length;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  if (!agent.actief) return;
                  setActieveAgent(agent);
                  setActiefGesprekId(null);
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 ${
                  isActief
                    ? "bg-zinc-800/80 text-white shadow-sm"
                    : agent.actief
                    ? "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
                    : "text-zinc-600 cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${agent.bgKleur} transition-colors`}
                >
                  <agent.icon className={`h-4 w-4 ${agent.kleur}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{agent.naam}</p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {agent.beschrijving}
                  </p>
                </div>
                {agent.actief ? (
                  <div className="ml-auto flex items-center gap-1.5">
                    {aantalGesprekken > 0 && (
                      <span className="text-[10px] text-zinc-500 font-medium">{aantalGesprekken}</span>
                    )}
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  </div>
                ) : (
                  <span className="ml-auto shrink-0 text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md ring-1 ring-amber-400/20">
                    soon
                  </span>
                )}
              </button>
            );
          })}

          {/* Gesprekken voor actieve agent */}
          {agentGesprekken.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3 pt-4 pb-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Gesprekken
                </p>
                <button
                  onClick={nieuwGesprek}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Nieuw gesprek"
                >
                  <Plus className="h-3 w-3" />
                  Nieuw
                </button>
              </div>
              {agentGesprekken.map((gesprek) => (
                <button
                  key={gesprek.id}
                  onClick={() => setActiefGesprekId(gesprek.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-all duration-150 ${
                    actiefGesprekId === gesprek.id
                      ? "bg-zinc-800/60 text-zinc-200"
                      : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-400"
                  }`}
                >
                  <MessageSquare className="h-3 w-3 shrink-0" />
                  <span className="text-xs truncate">{gesprek.titel}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Stats */}
        <div className="border-t border-zinc-800/80 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Agents online</span>
            <span className="text-emerald-400 font-medium">
              {agents.filter((a) => a.actief).length}/{agents.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Berichten vandaag</span>
            <span className="text-zinc-300 font-medium">
              {gesprekken.reduce(
                (total, g) =>
                  total + g.berichten.filter((m) => m.rol === "user").length,
                0
              )}
            </span>
          </div>
        </div>

        {/* User */}
        <div className="border-t border-zinc-800/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold">
              M
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">Michael</p>
              <p className="text-[11px] text-zinc-500">Eigenaar</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat header */}
        <header className="flex items-center gap-3 border-b border-zinc-800/80 px-6 py-4 bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${actieveAgent.bgKleur} ring-1 ${actieveAgent.borderKleur}`}
          >
            <actieveAgent.icon
              className={`h-5 w-5 ${actieveAgent.kleur}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold">{actieveAgent.naam}</h1>
            <p className="text-xs text-zinc-500">{actieveAgent.beschrijving}</p>
          </div>
          <div className="flex items-center gap-2">
            {berichten.length > 0 && (
              <button
                onClick={wisGesprek}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
                title="Gesprek verwijderen"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={nieuwGesprek}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              title="Nieuw gesprek"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nieuw</span>
            </button>
          </div>
        </header>

        {/* Messages — scrollable area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="mx-auto max-w-2xl px-6 py-6 space-y-8">
            {berichten.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${actieveAgent.bgKleur} ring-1 ${actieveAgent.borderKleur} mb-5`}
                >
                  <actieveAgent.icon
                    className={`h-8 w-8 ${actieveAgent.kleur}`}
                  />
                </div>
                <h2 className="text-lg font-semibold text-zinc-200">
                  {actieveAgent.naam}
                </h2>
                <p className="mt-2 text-sm text-zinc-500 max-w-sm leading-relaxed">
                  {actieveAgent.uitleg}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {actieveAgent.id === "assistent" && (
                    <>
                      <SuggestieChip tekst="Wat kun je allemaal?" onClick={(t) => { setInput(t); }} />
                      <SuggestieChip tekst="Welke agent past het best bij mijn vraag?" onClick={(t) => { setInput(t); }} />
                    </>
                  )}
                  {actieveAgent.id === "research" && (
                    <>
                      <SuggestieChip tekst="Vergelijk React met Vue" onClick={(t) => { setInput(t); }} />
                      <SuggestieChip tekst="Geef een overzicht van AI trends 2026" onClick={(t) => { setInput(t); }} />
                    </>
                  )}
                  {actieveAgent.id === "code" && (
                    <>
                      <SuggestieChip tekst="Maak een Lovable prompt voor een dashboard" onClick={(t) => { setInput(t); }} />
                      <SuggestieChip tekst="Ik heb een TypeScript error" onClick={(t) => { setInput(t); }} />
                    </>
                  )}
                  {actieveAgent.id === "build" && (
                    <>
                      <SuggestieChip tekst="Bouw een contact formulier component" onClick={(t) => { setInput(t); }} />
                      <SuggestieChip tekst="Maak een responsive navbar met Tailwind" onClick={(t) => { setInput(t); }} />
                    </>
                  )}
                </div>
              </div>
            )}

            {berichten.map((bericht, i) => (
              <div
                key={i}
                className={`group/msg flex gap-3 ${
                  bericht.rol === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {bericht.rol === "agent" && (
                  <div
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${actieveAgent.bgKleur}`}
                  >
                    <actieveAgent.icon
                      className={`h-3.5 w-3.5 ${actieveAgent.kleur}`}
                    />
                  </div>
                )}
                <div className="relative max-w-lg">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      bericht.rol === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-zinc-800/80 text-zinc-200 rounded-bl-md ring-1 ring-zinc-700/50"
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
                                  <div className="relative group/code my-2 rounded-lg overflow-hidden ring-1 ring-zinc-700/50">
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-700/50">
                                      <span className="text-[11px] text-zinc-500">{match[1]}</span>
                                      <button
                                        onClick={() => kopieer(codeString, i * 1000 + 1)}
                                        className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
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
                                      customStyle={{ margin: 0, background: "rgb(39 39 42 / 0.8)", fontSize: "12px" }}
                                    >
                                      {codeString}
                                    </SyntaxHighlighter>
                                  </div>
                                );
                              }
                              return (
                                <code className="rounded bg-zinc-700/50 px-1.5 py-0.5 text-xs text-zinc-300" {...props}>
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
                    className="absolute -bottom-6 right-1 flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-400 opacity-0 group-hover/msg:opacity-100 transition-opacity"
                  >
                    {gekopieerd === i ? (
                      <><Check className="h-3 w-3" /> Gekopieerd</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Kopieer</>
                    )}
                  </button>
                </div>
                {bericht.rol === "user" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[11px] font-bold">
                    M
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${actieveAgent.bgKleur}`}
                >
                  <actieveAgent.icon
                    className={`h-3.5 w-3.5 ${actieveAgent.kleur}`}
                  />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-zinc-800/80 ring-1 ring-zinc-700/50 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-duration:0.6s]" />
                    <div className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.15s] [animation-duration:0.6s]" />
                    <div className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.3s] [animation-duration:0.6s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input — fixed at bottom */}
        <div className="border-t border-zinc-800/80 px-6 py-4 bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verstuur();
            }}
            className="mx-auto flex max-w-2xl items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Bericht aan ${actieveAgent.naam}...`}
              disabled={!actieveAgent.actief}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || !actieveAgent.actief}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SuggestieChip({
  tekst,
  onClick,
}: {
  tekst: string;
  onClick: (tekst: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(tekst)}
      className="rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
    >
      {tekst}
    </button>
  );
}
