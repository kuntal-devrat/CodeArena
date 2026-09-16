"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  Download,
  Sparkles,
  Search,
  ArrowRight,
  Loader2,
  Shuffle,
  CheckCircle2,
  Circle,
  X,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Layers
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { Difficulty, ProblemSummary } from "@codearena/shared";

const INITIAL_PROBLEMS: ProblemSummary[] = [
  { id: "c_00001_two-sum", slug: "two-sum", title: "Two Sum", difficulty: "EASY", tags: ["Array", "Hash Table"], solvedByUser: false, attemptedByUser: false },
  { id: "c_00002_valid-parentheses", slug: "valid-parentheses", title: "Valid Parentheses", difficulty: "EASY", tags: ["Stack", "String"], solvedByUser: false, attemptedByUser: false },
  { id: "c_00003_longest-substring-without-repeating-characters", slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "MEDIUM", tags: ["Sliding Window", "String"], solvedByUser: false, attemptedByUser: false },
  { id: "c_00004_reverse-linked-list", slug: "reverse-linked-list", title: "Reverse Linked List", difficulty: "EASY", tags: ["Linked List", "Recursion"], solvedByUser: false, attemptedByUser: false },
  { id: "c_00015_3sum", slug: "3sum", title: "3Sum", difficulty: "MEDIUM", tags: ["Array", "Two Pointers", "Sorting"], solvedByUser: false, attemptedByUser: false },
  { id: "c_00042_trapping-rain-water", slug: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "HARD", tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"], solvedByUser: false, attemptedByUser: false },
];

const POPULAR_PRESETS = [
  { name: "Two Sum", slug: "two-sum", diff: "EASY" },
  { name: "Valid Parentheses", slug: "valid-parentheses", diff: "EASY" },
  { name: "Reverse Linked List", slug: "reverse-linked-list", diff: "EASY" },
  { name: "3Sum", slug: "3sum", diff: "MEDIUM" },
  { name: "Trapping Rain Water", slug: "trapping-rain-water", diff: "HARD" },
  { name: "Climbing Stairs", slug: "climbing-stairs", diff: "EASY" },
  { name: "LRU Cache", slug: "lru-cache", diff: "MEDIUM" },
  { name: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", diff: "HARD" },
];

const TOP_TOPICS = [
  "All Topics",
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Binary Search",
  "Depth-First Search",
  "Tree",
  "Matrix",
  "Two Pointers",
  "Bit Manipulation",
  "Stack",
  "Graph",
  "Sliding Window",
  "Linked List",
];

const DIFFICULTIES: (Difficulty | "ALL")[] = ["ALL", "EASY", "MEDIUM", "HARD"];

function getProblemNumber(p: ProblemSummary, fallbackIndex: number): number {
  if (p.id) {
    const match = p.id.match(/^c_0*(\d+)_/);
    if (match) return parseInt(match[1], 10);
    const num = parseInt(p.id, 10);
    if (!isNaN(num) && num > 0) return num;
  }
  return fallbackIndex;
}

function getPaginationRange(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function ProblemTable() {
  const router = useRouter();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [problems, setProblems] = useState<ProblemSummary[]>(INITIAL_PROBLEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [diffFilter, setDiffFilter] = useState<Difficulty | "ALL">("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  const [search, setSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [jumpPageInput, setJumpPageInput] = useState("");

  // LeetCode Importer State
  const [importInput, setImportInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  // Load problems from backend
  useEffect(() => {
    async function loadProblems() {
      try {
        setIsLoading(true);
        const res = await api.get("/api/problems");
        if (res.data?.problems && res.data.problems.length > 0) {
          setProblems(res.data.problems);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadProblems();
  }, []);

  // Compute breakdown counts
  const stats = useMemo(() => {
    let easy = 0;
    let med = 0;
    let hard = 0;
    for (const p of problems) {
      if (p.difficulty === "EASY") easy++;
      else if (p.difficulty === "MEDIUM") med++;
      else if (p.difficulty === "HARD") hard++;
    }
    return {
      total: problems.length,
      easy,
      medium: med,
      hard,
    };
  }, [problems]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [diffFilter, selectedTopic, search, pageSize]);

  // Scroll to table top on page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Jump to specific page
  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setJumpPageInput("");
    } else {
      toast.error(`Please enter a valid page between 1 and ${totalPages}`);
    }
  };

  // Filter problems
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const sWithoutHash = s.replace(/^#/, "");

    return problems.filter((p, index) => {
      // Difficulty match
      if (diffFilter !== "ALL" && p.difficulty !== diffFilter) {
        return false;
      }

      // Topic match
      if (selectedTopic !== "All Topics") {
        const hasTopic = (p.tags || []).some(
          (t) => t.toLowerCase() === selectedTopic.toLowerCase()
        );
        if (!hasTopic) return false;
      }

      // Search query match
      if (s) {
        const probNum = String(getProblemNumber(p, index + 1));
        const matchesTitle = p.title.toLowerCase().includes(s);
        const matchesSlug = p.slug.toLowerCase().includes(s);
        const matchesTag = (p.tags || []).some((t) => t.toLowerCase().includes(s));
        const matchesNum = probNum === sWithoutHash || (p.id && p.id.includes(sWithoutHash));

        if (!matchesTitle && !matchesSlug && !matchesTag && !matchesNum) {
          return false;
        }
      }

      return true;
    });
  }, [problems, diffFilter, selectedTopic, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Handle Pick Random Question
  const handlePickRandom = () => {
    const pool = filtered.length > 0 ? filtered : problems;
    if (pool.length === 0) return;
    const randomIdx = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIdx];
    toast.success(`Picked #${getProblemNumber(chosen, randomIdx + 1)}: ${chosen.title}!`, { icon: "🎲" });
    router.push(`/problems/${chosen.slug}`);
  };

  // Direct LeetCode import handler
  async function handleImport(slugOrUrlToImport?: string) {
    const target = (slugOrUrlToImport || importInput).trim();
    if (!target) {
      toast.error("Please enter a LeetCode problem slug or URL");
      return;
    }

    setIsImporting(true);
    toast.loading(`Scraping "${target}" directly from LeetCode...`, { id: "import-toast" });

    try {
      const res = await api.post("/api/problems/import", { slug: target });
      const imported = res.data.problem;

      toast.success(`Imported "${imported.title}" successfully!`, { id: "import-toast" });

      setProblems((prev) => {
        const exists = prev.some((p) => p.slug === imported.slug);
        if (exists) return prev;
        return [
          {
            id: imported.id,
            slug: imported.slug,
            title: imported.title,
            difficulty: imported.difficulty,
            tags: imported.tags || [],
            solvedByUser: false,
            attemptedByUser: false,
          },
          ...prev,
        ];
      });

      setImportInput("");
      setShowImporter(false);
      router.push(`/problems/${imported.slug}`);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to scrape problem from LeetCode";
      toast.error(msg, { id: "import-toast" });
    } finally {
      setIsImporting(false);
    }
  }

  const isFiltered = diffFilter !== "ALL" || selectedTopic !== "All Topics" || search.trim() !== "";

  return (
    <div ref={tableContainerRef} className="space-y-5 animate-m3-fade">
      {/* Top Banner / Importer Bar - M3 Card */}
      <div className="bg-m3-surface-container border border-m3-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-m3-primary/10 text-m3-primary rounded-xl border border-m3-primary/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-m3-on-surface text-sm sm:text-[14.5px] flex items-center gap-2">
                <span>Direct LeetCode Importer</span>
                <span className="text-[10.5px] font-mono bg-m3-surface-container-highest text-m3-primary px-2 py-0.5 rounded-full border border-m3-outline-variant/40">
                  python leetscrape
                </span>
              </div>
              <p className="text-[12.5px] text-m3-on-surface-variant mt-0.5 leading-normal">
                Import any problem on-demand from LeetCode with full testcases &amp; multi-language starter code.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowImporter(!showImporter)}
            className="m3-btn-tonal text-xs py-1.5 px-4 flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-m3-primary" />
            <span>{showImporter ? "Close Importer" : "Import Question"}</span>
          </button>
        </div>

        {/* Collapsible Importer Box */}
        {showImporter && (
          <div className="pt-4 border-t border-m3-outline-variant/30 space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleImport();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                placeholder="e.g. trapping-rain-water or https://leetcode.com/problems/trapping-rain-water/"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                className="flex-1 bg-m3-surface-container-lowest border border-m3-outline-variant/40 rounded-xl px-3.5 py-2 text-[13px] text-m3-on-surface placeholder-m3-on-surface-variant/50 focus:outline-none focus:border-m3-primary font-mono transition-colors"
              />
              <button
                type="submit"
                disabled={isImporting || !importInput.trim()}
                className="m3-btn-filled text-xs px-4 py-2 flex items-center justify-center gap-2 shrink-0"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{isImporting ? "Scraping..." : "Import & Solve"}</span>
              </button>
            </form>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <div className="text-[11.5px] text-m3-on-surface-variant/80 font-medium">Quick Select Presets:</div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_PRESETS.map((preset) => (
                  <button
                    key={preset.slug}
                    onClick={() => handleImport(preset.slug)}
                    disabled={isImporting}
                    className="text-[11.5px] bg-m3-surface-container-high hover:bg-m3-surface-container-highest border border-m3-outline-variant/40 hover:border-m3-outline text-m3-on-surface-variant hover:text-m3-on-surface px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>{preset.name}</span>
                    <span
                      className={clsx(
                        "w-2 h-2 rounded-full",
                        preset.diff === "EASY" && "bg-m3-success",
                        preset.diff === "MEDIUM" && "bg-m3-warning",
                        preset.diff === "HARD" && "bg-m3-error"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Difficulty Cards & Global Stats Bar - M3 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setDiffFilter("ALL")}
          className={clsx(
            "p-3.5 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between select-none active:scale-[0.98]",
            diffFilter === "ALL"
              ? "bg-m3-secondary-container border-m3-primary/60 text-m3-on-secondary-container shadow-xs"
              : "bg-m3-surface-container border-m3-outline-variant/30 hover:border-m3-outline hover:bg-m3-surface-container-high text-m3-on-surface"
          )}
        >
          <div className="text-[11px] font-medium uppercase tracking-wider text-m3-on-surface-variant flex items-center justify-between">
            <span>All Problems</span>
            <span className="w-2 h-2 rounded-full bg-m3-primary"></span>
          </div>
          <div className="text-xl font-bold font-sans tracking-tight text-m3-on-surface mt-1">
            {stats.total.toLocaleString()}
          </div>
        </button>

        <button
          onClick={() => setDiffFilter(diffFilter === "EASY" ? "ALL" : "EASY")}
          className={clsx(
            "p-3.5 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between select-none active:scale-[0.98]",
            diffFilter === "EASY"
              ? "bg-m3-success-container/30 border-m3-success/70 shadow-xs"
              : "bg-m3-surface-container border-m3-outline-variant/30 hover:border-m3-success/50 hover:bg-m3-surface-container-high"
          )}
        >
          <div className="text-[11px] font-medium uppercase tracking-wider text-m3-success flex items-center justify-between">
            <span>Easy</span>
            <span className="w-2 h-2 rounded-full bg-m3-success"></span>
          </div>
          <div className="text-xl font-bold font-sans tracking-tight text-m3-on-surface mt-1">
            {stats.easy.toLocaleString()}
          </div>
        </button>

        <button
          onClick={() => setDiffFilter(diffFilter === "MEDIUM" ? "ALL" : "MEDIUM")}
          className={clsx(
            "p-3.5 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between select-none active:scale-[0.98]",
            diffFilter === "MEDIUM"
              ? "bg-m3-warning-container/30 border-m3-warning/70 shadow-xs"
              : "bg-m3-surface-container border-m3-outline-variant/30 hover:border-m3-warning/50 hover:bg-m3-surface-container-high"
          )}
        >
          <div className="text-[11px] font-medium uppercase tracking-wider text-m3-warning flex items-center justify-between">
            <span>Medium</span>
            <span className="w-2 h-2 rounded-full bg-m3-warning"></span>
          </div>
          <div className="text-xl font-bold font-sans tracking-tight text-m3-on-surface mt-1">
            {stats.medium.toLocaleString()}
          </div>
        </button>

        <button
          onClick={() => setDiffFilter(diffFilter === "HARD" ? "ALL" : "HARD")}
          className={clsx(
            "p-3.5 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between select-none active:scale-[0.98]",
            diffFilter === "HARD"
              ? "bg-m3-error-container/30 border-m3-error/70 shadow-xs"
              : "bg-m3-surface-container border-m3-outline-variant/30 hover:border-m3-error/50 hover:bg-m3-surface-container-high"
          )}
        >
          <div className="text-[11px] font-medium uppercase tracking-wider text-m3-error flex items-center justify-between">
            <span>Hard</span>
            <span className="w-2 h-2 rounded-full bg-m3-error"></span>
          </div>
          <div className="text-xl font-bold font-sans tracking-tight text-m3-on-surface mt-1">
            {stats.hard.toLocaleString()}
          </div>
        </button>
      </div>

      {/* Filter & Search Bar - M3 Search Bar Style */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2.5">
          {/* M3 Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, tag, or #ID (e.g. Two Sum, #42)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-m3-surface-container-high border border-transparent rounded-full pl-9 pr-9 py-2 text-[13px] text-m3-on-surface placeholder-m3-on-surface-variant/60 focus:outline-none focus:border-m3-primary focus:ring-1 focus:ring-m3-primary/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-m3-on-surface-variant hover:text-m3-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* M3 Random Question Button */}
          <button
            onClick={handlePickRandom}
            className="m3-btn-tonal text-xs py-2 px-3.5 shrink-0"
            title="Pick a random problem from current list"
          >
            <Shuffle className="w-3.5 h-3.5 text-m3-warning" />
            <span className="hidden sm:inline">Pick Random</span>
          </button>
        </div>

        {/* Difficulty Selector Pills + Clear Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-m3-surface-container p-1 rounded-full border border-m3-outline-variant/40">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={clsx(
                  "text-xs font-medium px-3 py-1 rounded-full transition-all duration-150 capitalize select-none",
                  diffFilter === d
                    ? "bg-m3-secondary-container text-m3-on-secondary-container font-semibold shadow-xs"
                    : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high"
                )}
              >
                {d === "ALL" ? "All" : d.toLowerCase()}
              </button>
            ))}
          </div>

          {isFiltered && (
            <button
              onClick={() => {
                setDiffFilter("ALL");
                setSelectedTopic("All Topics");
                setSearch("");
              }}
              className="text-[12px] text-m3-primary hover:underline font-medium px-2 py-1 select-none"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Topic Tags Pills Bar - M3 Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11.5px] font-medium text-m3-on-surface-variant flex items-center gap-1 shrink-0 mr-1 select-none">
          <Layers className="w-3.5 h-3.5" />
          <span>Topics:</span>
        </span>
        {TOP_TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic;
          return (
            <button
              key={topic}
              onClick={() => setSelectedTopic(isSelected && topic !== "All Topics" ? "All Topics" : topic)}
              className={clsx(
                "m3-filter-pill",
                isSelected && "m3-filter-pill-active"
              )}
            >
              {topic}
            </button>
          );
        })}
      </div>

      {/* Top Results Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-m3-on-surface-variant bg-m3-surface-container-low border border-m3-outline-variant/25 rounded-xl px-3.5 py-2">
        <div>
          Showing{" "}
          <span className="font-semibold text-m3-on-surface">
            {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-m3-on-surface">
            {Math.min(currentPage * pageSize, filtered.length)}
          </span>{" "}
          of <span className="font-semibold text-m3-on-surface">{filtered.length.toLocaleString()}</span> problems
          {isFiltered && <span className="text-m3-primary ml-1.5 font-medium">(Filtered)</span>}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-m3-surface-container-high border border-m3-outline-variant/40 text-m3-on-surface text-xs rounded-lg px-2 py-0.5 focus:outline-none focus:border-m3-primary cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="font-mono text-m3-on-surface-variant">
            Page <span className="text-m3-on-surface font-semibold">{currentPage}</span> of{" "}
            <span className="text-m3-on-surface font-semibold">{totalPages}</span>
          </div>
        </div>
      </div>

      {/* Problem Table - M3 Table Styling */}
      <div className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-m3-outline-variant/30 bg-m3-surface-container text-[11.5px] font-medium uppercase tracking-wider text-m3-on-surface-variant">
              <th className="px-4 py-3 w-14 text-center">#</th>
              <th className="px-3 py-3 w-12 text-center">Status</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 w-32">Difficulty</th>
              <th className="px-4 py-3 hidden md:table-cell">Topics</th>
              <th className="px-4 py-3 w-24 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-m3-outline-variant/15">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-m3-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-m3-primary" />
                    <span className="text-xs font-medium">Loading 2,900+ questions from database...</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((p, i) => {
                const probNum = getProblemNumber(p, (currentPage - 1) * pageSize + i + 1);
                return (
                  <tr
                    key={p.id || p.slug}
                    onClick={() => router.push(`/problems/${p.slug}`)}
                    className="hover:bg-m3-surface-container-high/60 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="px-4 py-3 text-center font-mono text-xs text-m3-on-surface-variant/80 font-medium">
                      {probNum}
                    </td>

                    <td className="px-3 py-3 text-center">
                      {p.solvedByUser ? (
                        <CheckCircle2 className="w-4 h-4 text-m3-success mx-auto" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-m3-outline-variant group-hover:text-m3-on-surface-variant mx-auto transition-colors" />
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/problems/${p.slug}`}
                          className="text-[13.5px] sm:text-[14px] font-medium text-m3-on-surface group-hover:text-m3-primary transition-colors leading-snug"
                        >
                          {p.title}
                        </Link>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <DifficultyBadge difficulty={p.difficulty} />
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {(p.tags || []).slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[11px] bg-m3-surface-container-high border border-m3-outline-variant/30 px-2 py-0.5 rounded-md text-m3-on-surface-variant group-hover:border-m3-outline-variant/60 transition-colors"
                          >
                            {t}
                          </span>
                        ))}
                        {(p.tags || []).length > 3 && (
                          <span className="text-[10.5px] text-m3-on-surface-variant/60 font-mono">
                            +{p.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/problems/${p.slug}`}
                        className="m3-btn-tonal text-[11.5px] py-1 px-3 inline-flex items-center gap-1 group-hover:bg-m3-primary group-hover:text-m3-on-primary transition-all duration-150"
                      >
                        <span>Solve</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-m3-on-surface-variant space-y-3">
                  <div className="text-sm font-semibold text-m3-on-surface">No questions found matching your filters</div>
                  <p className="text-xs text-m3-on-surface-variant max-w-sm mx-auto leading-normal">
                    Try searching with another keyword or difficulty, or import any problem directly from LeetCode.
                  </p>
                  <button
                    onClick={() => setShowImporter(true)}
                    className="m3-btn-filled text-xs py-1.5 px-4 inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Import from LeetCode</span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Complete Bottom Pagination Bar with Full Navigation Buttons */}
        {filtered.length > 0 && (
          <div className="flex flex-col lg:flex-row items-center justify-between px-4 py-3 border-t border-m3-outline-variant/30 bg-m3-surface-container gap-3">
            {/* Status Text */}
            <div className="text-xs text-m3-on-surface-variant text-center lg:text-left">
              Showing <span className="font-semibold text-m3-on-surface">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-m3-on-surface">{Math.min(currentPage * pageSize, filtered.length)}</span> of{" "}
              <span className="font-semibold text-m3-on-surface">{filtered.length.toLocaleString()}</span> questions
            </div>

            {/* Pagination Controls - M3 Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              {/* First Page Button */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-m3-outline-variant/30 bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-on-surface-variant hover:text-m3-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs flex items-center gap-1"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">First</span>
              </button>

              {/* Prev Page Button */}
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-m3-outline-variant/30 bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-on-surface-variant hover:text-m3-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs flex items-center gap-1"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Window of Numeric Page Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {getPaginationRange(currentPage, totalPages).map((p, idx) => {
                  if (typeof p === "string") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-xs text-m3-on-surface-variant/50 font-mono select-none">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = p === currentPage;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={clsx(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold font-mono transition-all flex items-center justify-center select-none",
                        isCurrent
                          ? "bg-m3-primary text-m3-on-primary shadow-xs"
                          : "bg-m3-surface-container-high border border-m3-outline-variant/30 text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-highest"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Page Button */}
              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-m3-outline-variant/30 bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-on-surface-variant hover:text-m3-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs flex items-center gap-1"
                title="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page Button */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-m3-outline-variant/30 bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-on-surface-variant hover:text-m3-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs flex items-center gap-1"
                title="Last Page"
              >
                <span className="hidden sm:inline">Last</span>
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Jump to Page Input Form */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 text-xs text-m3-on-surface-variant">
              <span>Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder={`${currentPage}`}
                className="w-14 bg-m3-surface-container-high border border-m3-outline-variant/40 text-m3-on-surface text-xs font-mono text-center rounded-lg py-1 focus:outline-none focus:border-m3-primary"
              />
              <button
                type="submit"
                className="m3-btn-tonal text-xs py-1 px-2.5"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  if (difficulty === "EASY") {
    return <span className="m3-badge-easy">Easy</span>;
  }
  if (difficulty === "MEDIUM") {
    return <span className="m3-badge-medium">Medium</span>;
  }
  return <span className="m3-badge-hard">Hard</span>;
}
