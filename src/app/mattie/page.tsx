"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  Plus,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import DashboardLayout from "@/components/dashboard-layout";
import { AGENT_NAME, AGENT_ROLE, AGENT_DESCRIPTION, CHAT_PLACEHOLDER } from "@/lib/config";

type Message = {
  rol: "user" | "agent";
  tekst: string;
};

type Gesprek = {
  id: string;
  titel: string;
  berichten: Message[];
  aangemaakt: number;
};

const STORAGE_KEY = "mattie-gesprekken-v1";

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

export default function ChatPage() {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [actiefGesprekId]);

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

  const sidebarExtra = (
    <>
      {gesprekken.length > 0 && (
        <div className="px-3 pt-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 pb-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#666]">
              Gesprekken
            </p>
            <button
              onClick={nieuwGesprek}
              className="flex items-center gap-0.5 text-[10px] text-[#666] hover:text-[#999] transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-0.5">
            {gesprekken.slice(0, 10).map((gesprek) => (
              <button
                key={gesprek.id}
                onClick={() => setActiefGesprekId(gesprek.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-colors ${
                  actiefGesprekId === gesprek.id
                    ? "bg-white/[0.06] text-white"
                    : "text-[#666] hover:bg-white/[0.03] hover:text-[#999]"
                }`}
              >
                <MessageSquare className="h-3 w-3 shrink-0" />
                <span className="text-[10px] truncate">{gesprek.titel}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {gesprekken.length === 0 && <div className="flex-1" />}
    </>
  );

  const chatHeader = (
    <>
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.08]">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-white">{AGENT_NAME}</h1>
        <p className="text-[10px] text-[#666]">{AGENT_ROLE}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {berichten.length > 0 && (
          <button
            onClick={wisGesprek}
            className="flex items-center justify-center rounded-lg p-2 text-[#666] hover:text-[#ececec] hover:bg-white/[0.03] transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={nieuwGesprek}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] text-[#666] hover:text-[#ececec] hover:bg-white/[0.03] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nieuw
        </button>
      </div>
    </>
  );

  return (
    <DashboardLayout sidebarExtra={sidebarExtra} header={chatHeader}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="mx-auto max-w-2xl px-6 py-6 space-y-6">
          {berichten.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.08] mb-4">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-base font-semibold text-white">{AGENT_NAME}</h2>
              <p className="mt-1.5 text-sm text-[#666] max-w-sm leading-relaxed">
                {AGENT_DESCRIPTION}
              </p>
            </div>
          )}

          {berichten.map((bericht, i) => (
            <div
              key={i}
              className={`group/msg flex gap-3 ${bericht.rol === "user" ? "justify-end" : "justify-start"}`}
            >
              {bericht.rol === "agent" && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div className="relative max-w-lg">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    bericht.rol === "user"
                      ? "bg-white/[0.06] text-[#ececec] rounded-br-md"
                      : "text-[#ececec] rounded-bl-md"
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
                                <div className="relative my-2 rounded-xl overflow-hidden border border-white/[0.05]">
                                  <div className="flex items-center justify-between px-3 py-1 bg-[#171717] border-b border-white/[0.06]">
                                    <span className="text-[10px] text-[#666]">{match[1]}</span>
                                    <button
                                      onClick={() => kopieer(codeString, i * 1000 + 1)}
                                      className="flex items-center gap-1 text-[10px] text-[#666] hover:text-[#ececec] transition-colors"
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
                                    customStyle={{ margin: 0, background: "#171717" }}
                                  >
                                    {codeString}
                                  </SyntaxHighlighter>
                                </div>
                              );
                            }
                            return (
                              <code className="rounded-lg bg-white/[0.04] px-1.5 py-0.5 text-xs text-[#9b9b9b]" {...props}>
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
                  className="absolute -bottom-5 right-1 flex items-center gap-1 text-[10px] text-[#666] hover:text-[#9b9b9b] opacity-0 group-hover/msg:opacity-100 transition-opacity"
                >
                  {gekopieerd === i ? (
                    <><Check className="h-3 w-3" /> Gekopieerd</>
                  ) : (
                    <><Copy className="h-3 w-3" /> Kopieer</>
                  )}
                </button>
              </div>
              {bericht.rol === "user" && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#171717] text-[10px] font-bold">
                  M
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#666] animate-bounce [animation-duration:0.6s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#666] animate-bounce [animation-delay:0.15s] [animation-duration:0.6s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#666] animate-bounce [animation-delay:0.3s] [animation-duration:0.6s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] px-6 py-3 bg-[#2f2f2f] shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); verstuur(); }}
          className="mx-auto flex max-w-2xl items-center gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={CHAT_PLACEHOLDER}
            className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-sm text-[#ececec] placeholder:text-[#666] focus:border-white/[0.12] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#171717] transition-all hover:bg-white/90 disabled:opacity-30 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
