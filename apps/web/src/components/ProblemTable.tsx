"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { Difficulty, ProblemSummary } from "@codearena/shared";

// Placeholder data — replace with API call
const MOCK_PROBLEMS: ProblemSummary[] = [
  { id: "1", slug: "two-sum", title: "Two Sum", difficulty: "EASY", tags: ["Array", "Hash Table"], solvedByUser: false, attemptedByUser: false },
  { id: "2", slug: "add-two-numbers", title: "Add Two Numbers", difficulty: "MEDIUM", tags: ["Linked List"], solvedByUser: false, attemptedByUser: false },
  { id: "3", slug: "longest-substring", title: "Longest Substring Without Repeating Characters", difficulty: "MEDIUM", tags: ["Sliding Window", "String"], solvedByUser: false, attemptedByUser: false },
  { id: "4", slug: "median-sorted-arrays", title: "Median of Two Sorted Arrays", difficulty: "HARD", tags: ["Binary Search", "Array"], solvedByUser: false, attemptedByUser: false },
];

const DIFFICULTIES: (Difficulty | "ALL")[] = ["ALL", "EASY", "MEDIUM", "HARD"];

export function ProblemTable() {
  const [filter, setFilter] = useState<Difficulty | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = MOCK_PROBLEMS.filter((p) => {
    const matchesDiff = filter === "ALL" || p.difficulty === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-arena-surface border border-arena-border rounded-lg px-3 py-2 text-sm text-white placeholder-arena-muted focus:outline-none focus:border-brand-500 w-64"
        />
        <div className="flex gap-1">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={clsx(
                "text-xs font-semibold px-3 py-1.5 rounded-full transition-colors",
                filter === d
                  ? "bg-brand-500 text-white"
                  : "bg-arena-surface text-arena-muted hover:text-white border border-arena-border"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena-border text-arena-muted">
              <th className="text-left px-4 py-3 font-medium w-8">#</th>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Difficulty</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={p.id}
                className="border-b border-arena-border/50 hover:bg-arena-surface/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-arena-muted">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-white hover:text-brand-500">
                  {p.title}
                </td>
                <td className="px-4 py-3">
                  <DifficultyBadge difficulty={p.difficulty} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-arena-bg border border-arena-border px-2 py-0.5 rounded-full text-arena-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-arena-muted">
                  No problems match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={clsx("difficulty-badge", {
        easy: difficulty === "EASY",
        medium: difficulty === "MEDIUM",
        hard: difficulty === "HARD",
      })}
    >
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </span>
  );
}
