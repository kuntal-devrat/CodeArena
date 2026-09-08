import axios from "axios";
import { prisma } from "./db";

const JUDGE_URL = process.env.JUDGE_URL ?? "http://localhost:5000";

interface JudgeRequest {
  submissionId: string;
  code: string;
  language: string;
  testCases: object[];
  isRun: boolean;
}

export const judgeService = {
  async judge(req: JudgeRequest): Promise<void> {
    // Mark submission as RUNNING
    await prisma.submission.update({
      where: { id: req.submissionId },
      data: { verdict: "RUNNING" },
    });

    const response = await axios.post(`${JUDGE_URL}/run`, {
      submissionId: req.submissionId,
      code: req.code,
      language: req.language,
      testCases: req.testCases,
      isRun: req.isRun,
      timeoutMs: parseInt(process.env.JUDGE_TIMEOUT_MS ?? "5000"),
      memoryLimitMb: parseInt(process.env.JUDGE_MEMORY_LIMIT_MB ?? "256"),
    });

    const { verdict, runtime, memory, errorMessage } = response.data;

    await prisma.submission.update({
      where: { id: req.submissionId },
      data: { verdict, runtime, memory, errorMessage },
    });
  },
};
