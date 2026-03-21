"use client";

import {
  Bot,
  MessageSquare,
  LayoutTemplate,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export default function LogboekPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-zinc-800/60 bg-zinc-900/40">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-white/10">
            <Bot className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">Mattie</span>
            <p className="text-[10px] text-zinc-500">Dashboard</p>
          </div>
        </div>

        <nav className="px-3 pt-3 pb-1 space-y-0.5">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors">
            <MessageSquare className="h-4 w-4" />
            Chat
          </Link>
          <Link href="/agents" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors">
            <LayoutTemplate className="h-4 w-4" />
            Agents
          </Link>
          <Link href="/logboek" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white bg-zinc-800/60">
            <BookOpen className="h-4 w-4 text-zinc-400" />
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
          <h1 className="text-xl font-semibold tracking-tight">Logboek</h1>
          <p className="text-sm text-zinc-500 mt-1 mb-8">Dagelijkse sessie logs en voortgang</p>

          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 ring-1 ring-zinc-700/30 mb-4">
              <BookOpen className="h-7 w-7 text-zinc-500" />
            </div>
            <h2 className="text-base font-medium text-zinc-400">Binnenkort beschikbaar</h2>
            <p className="mt-1.5 text-sm text-zinc-600 max-w-sm">
              Hier komen de dagelijkse logboeken te staan, gekoppeld aan de memory bestanden op het systeem.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
