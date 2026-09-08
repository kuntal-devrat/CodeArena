export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  starterCode: Record<string, string>; // language -> starter snippet
  createdAt: string;
}

export interface ProblemSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  solvedByUser: boolean;
  attemptedByUser: boolean;
}
