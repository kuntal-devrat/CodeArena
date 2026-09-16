import { ProblemTable } from "@/components/ProblemTable";

export const metadata = { title: "Problems — CodeArena" };

export default function ProblemsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-m3-outline-variant/30 pb-5">
        <div>
          <div className="text-[11px] font-medium text-m3-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-m3-success animate-pulse"></span>
            <span>2,913 Problems Available</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-semibold tracking-tight text-m3-on-surface leading-snug">
            Problem Bank
          </h1>
          <p className="text-m3-on-surface-variant text-[13.5px] mt-1 max-w-2xl leading-relaxed">
            Browse through official LeetCode problems with full test suites, multi-language solutions, interactive editorials, and real-time execution.
          </p>
        </div>
      </div>
      <ProblemTable />
    </div>
  );
}

