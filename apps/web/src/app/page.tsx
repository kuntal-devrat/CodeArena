import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Logo / Brand */}
        <div className="inline-flex items-center gap-2 text-brand-500 font-mono text-sm font-semibold uppercase tracking-widest mb-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          Beta
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Code better,{" "}
          <span className="text-brand-500">together.</span>
        </h1>

        <p className="text-arena-muted text-lg md:text-xl max-w-xl mx-auto">
          CodeArena brings real-time rooms, Peek, and spectating to your coding
          practice — turning solitary grinding into a shared experience.
        </p>

        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link href="/problems" className="btn-primary text-base px-6 py-3">
            Browse Problems
          </Link>
          <Link href="/rooms" className="btn-ghost text-base px-6 py-3 border border-arena-border">
            Join a Room
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left">
          {features.map((f) => (
            <div key={f.title} className="card space-y-2">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-arena-muted text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const features = [
  {
    icon: "🏟️",
    title: "Rooms",
    description:
      "Create persistent or one-off rooms. Free practice, same-problem sync, or head-to-head duels with friends.",
  },
  {
    icon: "👀",
    title: "Peek",
    description:
      "Stuck? Request a time-boxed view of a friend's code. Consent-first, always visible, instantly revocable.",
  },
  {
    icon: "🎉",
    title: "Live Presence",
    description:
      "Spectate sessions in real time. Cheer with emoji reactions. The coder always knows who's watching.",
  },
];
