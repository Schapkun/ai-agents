export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <main className="text-center">
        <h1 className="text-5xl font-bold text-white">
          AI Agents
        </h1>
        <p className="mt-4 text-xl text-zinc-400">
          Welkom Michael. Je dashboard wordt gebouwd.
        </p>

        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="rounded-xl bg-zinc-900 p-6 border border-zinc-800">
            <div className="text-3xl font-bold text-green-400">3</div>
            <div className="mt-2 text-zinc-400">Agents actief</div>
          </div>
          <div className="rounded-xl bg-zinc-900 p-6 border border-zinc-800">
            <div className="text-3xl font-bold text-blue-400">127</div>
            <div className="mt-2 text-zinc-400">Gesprekken vandaag</div>
          </div>
          <div className="rounded-xl bg-zinc-900 p-6 border border-zinc-800">
            <div className="text-3xl font-bold text-purple-400">99.8%</div>
            <div className="mt-2 text-zinc-400">Uptime</div>
          </div>
        </div>
      </main>
    </div>
  );
}
