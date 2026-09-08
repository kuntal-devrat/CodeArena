export type SubmissionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "PENDING"
  | "RUNNING";

export type Language = "python" | "javascript" | "typescript" | "java" | "cpp" | "go" | "rust";

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  language: Language;
  code: string;
  verdict: SubmissionVerdict;
  runtime?: number;   // ms
  memory?: number;    // KB
  errorMessage?: string;
  submittedAt: string;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime: number;
}

export interface RunResult {
  verdict: SubmissionVerdict;
  testCaseResults: TestCaseResult[];
  compilationError?: string;
}
