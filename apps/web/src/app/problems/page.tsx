import { ProblemTable } from "@/components/ProblemTable";

export const metadata = { title: "Problems — CodeArena" };

export default function ProblemsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Problems</h1>
        <p className="text-arena-muted mt-1">
          Filter by difficulty, topic, or company tag. Track your progress as you go.
        </p>
      </div>
      <ProblemTable />
    </div>
  );
}
