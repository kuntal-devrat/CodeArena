"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Code2, ExternalLink, Filter, Loader2, ArrowRight, X, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface SubmissionItem {
  id: string;
  problemId: string;
  language: string;
  code: string;
  verdict: string;
  runtime: number | null;
  memory: number | null;
  errorMessage?: string | null;
  submittedAt: string;
  problem?: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
  };
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterVerdict, setFilterVerdict] = useState<string>("ALL");
  const [filterLang, setFilterLang] = useState<string>("ALL");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSubmissions() {
      try {
        setIsLoading(true);
        const res = await api.get("/api/submissions");
        setSubmissions(res.data || []);
      } catch {
        // Fallback if network or unauthenticated
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadSubmissions();
  }, []);

  const filtered = submissions.filter((s) => {
    const matchesVerdict =
      filterVerdict === "ALL" ||
      (filterVerdict === "ACCEPTED" && s.verdict === "ACCEPTED") ||
      (filterVerdict === "FAILED" && s.verdict !== "ACCEPTED");
    const matchesLang = filterLang === "ALL" || s.language.toLowerCase() === filterLang.toLowerCase();
    return matchesVerdict && matchesLang;
  });

  const totalAccepted = submissions.filter((s) => s.verdict === "ACCEPTED").length;
  const acceptanceRate = submissions.length > 0 ? Math.round((totalAccepted / submissions.length) * 100) : 0;

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full space-y-6 font-sans animate-m3-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-m3-outline-variant/30 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-[26px] font-semibold text-m3-on-surface tracking-tight flex items-center gap-2.5">
            <span>Submissions History</span>
            <span className="text-[11px] font-mono font-medium bg-m3-surface-container-highest text-m3-primary px-2.5 py-0.5 rounded-full border border-m3-outline-variant/40">
              {submissions.length} Total
            </span>
          </h1>
          <p className="text-[13.5px] text-m3-on-surface-variant leading-relaxed">
            Track and review your past code submissions, performance benchmarks, and verdicts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/problems"
            className="m3-btn-filled text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <span>Solve More Problems</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards - M3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-m3-surface-container border border-m3-outline-variant/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="p-2.5 bg-m3-primary/10 text-m3-primary rounded-xl border border-m3-primary/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-sans text-m3-on-surface">{submissions.length}</div>
            <div className="text-[11.5px] text-m3-on-surface-variant font-medium">Total Submissions</div>
          </div>
        </div>

        <div className="bg-m3-surface-container border border-m3-outline-variant/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="p-2.5 bg-m3-success/10 text-m3-success rounded-xl border border-m3-success/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-sans text-m3-success">{totalAccepted}</div>
            <div className="text-[11.5px] text-m3-on-surface-variant font-medium">Accepted Solutions</div>
          </div>
        </div>

        <div className="bg-m3-surface-container border border-m3-outline-variant/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="p-2.5 bg-m3-warning/10 text-m3-warning rounded-xl border border-m3-warning/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-sans text-m3-warning">{acceptanceRate}%</div>
            <div className="text-[11.5px] text-m3-on-surface-variant font-medium">Acceptance Rate</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-m3-surface-container-low border border-m3-outline-variant/30 p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-m3-on-surface-variant font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {["ALL", "ACCEPTED", "FAILED"].map((v) => (
            <button
              key={v}
              onClick={() => setFilterVerdict(v)}
              className={clsx(
                "m3-filter-pill",
                filterVerdict === v && "m3-filter-pill-active"
              )}
            >
              {v === "ALL" ? "All Status" : v === "ACCEPTED" ? "Accepted Only" : "Failed Only"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-m3-on-surface-variant font-medium">Language:</span>
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="bg-m3-surface-container-high border border-m3-outline-variant/40 text-xs text-m3-on-surface rounded-lg px-2.5 py-1 focus:outline-none focus:border-m3-primary"
          >
            <option value="ALL">All Languages</option>
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>
      </div>

      {/* Submissions Table - M3 */}
      <div className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs sm:text-[13px]">
          <thead>
            <tr className="border-b border-m3-outline-variant/30 bg-m3-surface-container text-m3-on-surface-variant text-[11px] font-medium uppercase tracking-wider">
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Problem</th>
              <th className="px-5 py-3">Language</th>
              <th className="px-5 py-3">Runtime</th>
              <th className="px-5 py-3">Submitted</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-m3-outline-variant/15">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-m3-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-m3-primary" />
                    <span className="text-xs">Loading submission records...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-m3-surface-container-high text-m3-on-surface-variant flex items-center justify-center mx-auto">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div className="text-m3-on-surface font-semibold text-sm">No submissions found</div>
                  <p className="text-xs text-m3-on-surface-variant max-w-sm mx-auto leading-normal">
                    {submissions.length === 0
                      ? "You haven't submitted any solutions yet. Head over to the problems workspace to run and submit code!"
                      : "No submissions matched the selected filter criteria."}
                  </p>
                  <Link href="/problems" className="m3-btn-filled text-xs px-4 py-2 inline-flex items-center gap-1.5">
                    Browse Problems
                  </Link>
                </td>
              </tr>
            ) : (
              filtered.map((sub) => {
                const isAccepted = sub.verdict === "ACCEPTED";
                const isPending = sub.verdict === "PENDING" || sub.verdict === "RUNNING";
                const dateStr = new Date(sub.submittedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={sub.id} className="hover:bg-m3-surface-container-high/60 transition-colors group">
                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isAccepted ? (
                          <CheckCircle2 className="w-4 h-4 text-m3-success shrink-0" />
                        ) : isPending ? (
                          <Loader2 className="w-4 h-4 text-m3-warning animate-spin shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-m3-error shrink-0" />
                        )}
                        <span
                          className={clsx(
                            "text-xs font-medium uppercase tracking-wide",
                            isAccepted
                              ? "text-m3-success"
                              : isPending
                              ? "text-m3-warning"
                              : "text-m3-error"
                          )}
                        >
                          {sub.verdict.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>

                    {/* Problem Title & Link */}
                    <td className="px-5 py-3.5">
                      {sub.problem ? (
                        <Link
                          href={`/problems/${sub.problem.slug}`}
                          className="font-medium text-m3-on-surface hover:text-m3-primary transition-colors flex items-center gap-1.5"
                        >
                          <span>{sub.problem.title}</span>
                          <ExternalLink className="w-3 h-3 text-m3-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ) : (
                        <span className="text-m3-on-surface-variant text-xs font-mono">{sub.problemId}</span>
                      )}
                    </td>

                    {/* Language */}
                    <td className="px-5 py-3.5 text-xs font-mono text-m3-on-surface-variant capitalize">
                      <span className="bg-m3-surface-container-high border border-m3-outline-variant/30 px-2 py-0.5 rounded">
                        {sub.language}
                      </span>
                    </td>

                    {/* Runtime */}
                    <td className="px-5 py-3.5 text-xs font-mono text-m3-on-surface-variant">
                      {sub.runtime !== null ? `${sub.runtime} ms` : "—"}
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 text-xs text-m3-on-surface-variant/80 font-mono whitespace-nowrap">
                      {dateStr}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="m3-btn-tonal text-xs py-1 px-3 inline-flex items-center gap-1"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>View Code</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Code Inspector Modal - M3 Surface */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-m3-surface-container border border-m3-outline-variant/40 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-m3-fade">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-m3-outline-variant/30 flex items-center justify-between bg-m3-surface-container-high">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={clsx(
                      "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                      selectedSubmission.verdict === "ACCEPTED"
                        ? "bg-m3-success-container/40 text-m3-success border border-m3-success/30"
                        : "bg-m3-error-container/40 text-m3-error border border-m3-error/30"
                    )}
                  >
                    {selectedSubmission.verdict.replace(/_/g, " ")}
                  </span>
                  <span className="text-m3-on-surface font-medium text-sm">
                    {selectedSubmission.problem?.title || "Submission Details"}
                  </span>
                </div>
                <div className="text-xs text-m3-on-surface-variant font-mono">
                  {selectedSubmission.language} • {selectedSubmission.runtime ?? 0} ms runtime
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyCode(selectedSubmission.code)}
                  className="p-2 text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-highest rounded-full transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="w-4 h-4 text-m3-success" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-highest rounded-full transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error message if present */}
            {selectedSubmission.errorMessage && (
              <div className="bg-m3-error-container/30 border-b border-m3-error/30 px-6 py-3 text-xs text-m3-error font-mono flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-m3-error shrink-0 mt-0.5" />
                <div className="whitespace-pre-wrap">{selectedSubmission.errorMessage}</div>
              </div>
            )}

            {/* Code Body */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-m3-surface-container-lowest text-m3-on-surface">
              <pre className="whitespace-pre overflow-x-auto selection:bg-m3-primary/30">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-m3-outline-variant/30 bg-m3-surface-container-high flex items-center justify-between text-xs">
              <span className="text-m3-on-surface-variant/80 font-mono">
                Submitted on {new Date(selectedSubmission.submittedAt).toLocaleString()}
              </span>
              {selectedSubmission.problem && (
                <Link
                  href={`/problems/${selectedSubmission.problem.slug}`}
                  className="text-m3-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>Open Problem Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
