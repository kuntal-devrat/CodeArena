import Link from "next/link";
import {
  Code2,
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
  Users,
  Eye,
  CheckCircle2,
  Terminal,
  BookOpen,
  Layers,
  ChevronRight
} from "lucide-react";

const FEATURED_PROBLEMS = [
  { id: "#1", slug: "two-sum", title: "Two Sum", difficulty: "EASY", tags: ["Array", "Hash Table"] },
  { id: "#20", slug: "valid-parentheses", title: "Valid Parentheses", difficulty: "EASY", tags: ["Stack", "String"] },
  { id: "#3", slug: "longest-substring-without-repeating-characters", title: "Longest Substring", difficulty: "MEDIUM", tags: ["Sliding Window"] },
  { id: "#15", slug: "3sum", title: "3Sum", difficulty: "MEDIUM", tags: ["Two Pointers", "Sorting"] },
  { id: "#42", slug: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "HARD", tags: ["Dynamic Programming", "Stack"] },
  { id: "#146", slug: "lru-cache", title: "LRU Cache", difficulty: "MEDIUM", tags: ["Hash Table", "Linked List"] },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-m3-surface text-m3-on-surface flex flex-col font-sans animate-m3-fade">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-12 text-center max-w-5xl mx-auto space-y-6">
        {/* Glow Accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-m3-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-m3-surface-container-high border border-m3-outline-variant/40 text-m3-primary text-xs font-medium tracking-wide shadow-xs select-none">
          <Sparkles className="w-3.5 h-3.5 text-m3-primary animate-pulse" />
          <span>2,913+ Official LeetCode Problems Available Upfront</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15] text-m3-on-surface">
          Master Algorithms. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-m3-primary via-sky-300 to-indigo-300">
            Ace Technical Interviews.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-m3-on-surface-variant text-[13.5px] sm:text-[15px] max-w-2xl mx-auto leading-relaxed">
          CodeArena pairs LeetCode’s complete problem catalog with instant local code execution, 
          in-depth editorial walkthroughs, and real-time multiplayer coding rooms.
        </p>

        {/* CTA Buttons - M3 Button Shapes */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <Link
            href="/problems"
            className="m3-btn-filled text-[13px] px-5 py-2.5 flex items-center gap-2 shadow-sm"
          >
            <span>Browse 2,900+ Problems</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/problems/two-sum"
            className="m3-btn-tonal text-[13px] px-5 py-2.5 flex items-center gap-2"
          >
            <span>Solve #1 Two Sum</span>
            <Flame className="w-4 h-4 text-m3-warning" />
          </Link>
          <Link
            href="/rooms"
            className="m3-btn-outlined text-[13px] px-4 py-2.5 flex items-center gap-2 text-m3-on-surface-variant hover:text-m3-on-surface"
          >
            <Users className="w-4 h-4 text-m3-primary" />
            <span>Join Arena Room</span>
          </Link>
        </div>

        {/* Metric Highlights - M3 Cards */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
          <div className="bg-m3-surface-container border border-m3-outline-variant/30 p-3 rounded-2xl text-left">
            <div className="text-[11px] font-medium uppercase tracking-wider text-m3-on-surface-variant">Total Loaded</div>
            <div className="text-xl sm:text-2xl font-bold font-sans text-m3-on-surface mt-0.5">2,913</div>
          </div>
          <div className="bg-m3-surface-container border border-m3-outline-variant/30 p-3 rounded-2xl text-left">
            <div className="text-[11px] font-medium uppercase tracking-wider text-m3-success">Easy Questions</div>
            <div className="text-xl sm:text-2xl font-bold font-sans text-m3-success mt-0.5">763</div>
          </div>
          <div className="bg-m3-surface-container border border-m3-outline-variant/30 p-3 rounded-2xl text-left">
            <div className="text-[11px] font-medium uppercase tracking-wider text-m3-warning">Medium Questions</div>
            <div className="text-xl sm:text-2xl font-bold font-sans text-m3-warning mt-0.5">1,464</div>
          </div>
          <div className="bg-m3-surface-container border border-m3-outline-variant/30 p-3 rounded-2xl text-left">
            <div className="text-[11px] font-medium uppercase tracking-wider text-m3-error">Hard Questions</div>
            <div className="text-xl sm:text-2xl font-bold font-sans text-m3-error mt-0.5">686</div>
          </div>
        </div>
      </section>

      {/* Featured Classic Questions Section */}
      <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-m3-on-surface flex items-center gap-2">
              <Flame className="w-4.5 h-4.5 text-m3-warning" />
              <span>Essential Interview Classics</span>
            </h2>
            <p className="text-xs sm:text-[13px] text-m3-on-surface-variant mt-0.5">
              Top frequently asked technical interview problems with verified test suites.
            </p>
          </div>
          <Link
            href="/problems"
            className="text-xs sm:text-[13px] text-m3-primary hover:underline flex items-center gap-1 font-medium"
          >
            <span>View All Problems</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURED_PROBLEMS.map((p) => (
            <Link
              key={p.slug}
              href={`/problems/${p.slug}`}
              className="bg-m3-surface-container hover:bg-m3-surface-container-high border border-m3-outline-variant/30 hover:border-m3-outline/60 p-4 rounded-2xl transition-all duration-150 group flex flex-col justify-between space-y-3 shadow-xs active:scale-[0.99]"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-m3-on-surface-variant/70 font-medium">{p.id}</span>
                  <span
                    className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      p.difficulty === "EASY"
                        ? "bg-m3-success-container/40 text-m3-success border border-m3-success/30"
                        : p.difficulty === "MEDIUM"
                        ? "bg-m3-warning-container/40 text-m3-warning border border-m3-warning/30"
                        : "bg-m3-error-container/40 text-m3-error border border-m3-error/30"
                    }`}
                  >
                    {p.difficulty.toLowerCase()}
                  </span>
                </div>
                <div className="font-medium text-m3-on-surface group-hover:text-m3-primary transition-colors text-[14.5px]">
                  {p.title}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-m3-outline-variant/20 text-xs">
                <div className="flex gap-1">
                  {p.tags.map((t) => (
                    <span key={t} className="text-m3-on-surface-variant bg-m3-surface-container-high px-2 py-0.5 rounded-md text-[11px] border border-m3-outline-variant/30">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="text-m3-primary font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 text-[12px]">
                  Solve →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full space-y-5">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-m3-on-surface">
            Built for Serious Software Engineers
          </h2>
          <p className="text-xs sm:text-[13px] text-m3-on-surface-variant leading-relaxed">
            Everything you need to grind data structures and algorithms without friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          <div className="bg-m3-surface-container border border-m3-outline-variant/30 p-5 rounded-2xl space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-m3-primary/10 text-m3-primary flex items-center justify-center border border-m3-primary/20">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-medium text-m3-on-surface text-[15px]">Instant Code Execution</h3>
            <p className="text-m3-on-surface-variant text-[13px] leading-relaxed">
              Execute Python, JavaScript, TypeScript, C++, and Java code with auto-injected test harnesses and sub-millisecond execution times.
            </p>
          </div>

          <div className="bg-m3-surface-container border border-m3-outline-variant/30 p-5 rounded-2xl space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-m3-warning/10 text-m3-warning flex items-center justify-center border border-m3-warning/20">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-medium text-m3-on-surface text-[15px]">Editorials &amp; 1-Click Solutions</h3>
            <p className="text-m3-on-surface-variant text-[13px] leading-relaxed">
              Deep dive into algorithmic invariants, time/space complexities, progressive hints, and apply working solutions straight to Monaco editor.
            </p>
          </div>

          <div className="bg-m3-surface-container border border-m3-outline-variant/30 p-5 rounded-2xl space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-m3-tertiary/10 text-m3-tertiary flex items-center justify-center border border-m3-tertiary/20">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-medium text-m3-on-surface text-[15px]">Multiplayer Arena Rooms</h3>
            <p className="text-m3-on-surface-variant text-[13px] leading-relaxed">
              Create rooms, practice collaboratively with peers, spectate live sessions, or peek with consent when stuck on a tough test case.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-m3-outline-variant/30 py-6 text-center text-xs text-m3-on-surface-variant space-y-1">
        <div>CodeArena — Social Competitive Coding Platform</div>
        <div className="text-m3-on-surface-variant/60">2,913 questions ingested · Real-time execution · Room synchronization</div>
      </footer>
    </main>
  );
}
