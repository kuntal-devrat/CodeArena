import { Request, Response } from "express";
import { executeCode } from "./executor";
import type { SubmissionVerdict } from "@codearena/shared";

interface TestCase {
  input: string;
  expected: string;
}

interface RunRequest {
  submissionId: string;
  code: string;
  language: string;
  testCases: TestCase[];
  isRun: boolean;
  timeoutMs?: number;
  memoryLimitMb?: number;
}

export async function runHandler(req: Request, res: Response) {
  const {
    code,
    language,
    testCases,
    isRun,
    timeoutMs = 5000,
    memoryLimitMb = 256,
  }: RunRequest = req.body;

  // In run mode, only test against the first 3 cases (sample)
  const cases = isRun ? testCases.slice(0, 3) : testCases;

  const results: {
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    runtime: number;
  }[] = [];

  let verdict: SubmissionVerdict = "ACCEPTED";
  let totalRuntime = 0;
  let compilationError: string | undefined;

  for (const tc of cases) {
    const result = await executeCode({
      code,
      language,
      stdin: tc.input,
      timeoutMs,
      memoryLimitMb,
    });

    if (result.compileError) {
      compilationError = result.compileError;
      verdict = "COMPILE_ERROR";
      break;
    }

    if (result.timedOut) {
      verdict = "TIME_LIMIT_EXCEEDED";
      break;
    }

    if (result.runtimeError) {
      verdict = "RUNTIME_ERROR";
      break;
    }

    const actual = result.stdout.trim();
    const expected = tc.expected.trim();
    const passed = actual === expected;
    totalRuntime += result.runtimeMs;

    results.push({
      passed,
      input: tc.input,
      expected,
      actual,
      runtime: result.runtimeMs,
    });

    if (!passed && verdict === "ACCEPTED") {
      verdict = "WRONG_ANSWER";
    }
  }

  res.json({
    verdict,
    runtime: Math.round(totalRuntime / Math.max(results.length, 1)),
    memory: null, // populate in production with real resource tracking
    errorMessage: compilationError,
    testCaseResults: results,
  });
}
