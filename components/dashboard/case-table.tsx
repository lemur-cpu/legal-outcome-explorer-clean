"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { getCases } from "@/lib/api";
import type { CaseItem, OutcomeType } from "@/lib/types";
import { OutcomeBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SortKey = "case_id" | "court" | "year" | "outcome" | "label_confidence";
type SortDir = "asc" | "desc";

const OUTCOME_OPTIONS: { label: string; value: OutcomeType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Affirmed", value: "affirmed" },
  { label: "Reversed", value: "reversed" },
  { label: "Remanded", value: "remanded" },
];

const PAGE_SIZE = 50;

const COURT_LABELS: Record<string, string> = {
  "ca1": "1st Cir.",
  "ca2": "2nd Cir.",
  "ca3": "3rd Cir.",
  "ca4": "4th Cir.",
  "ca5": "5th Cir.",
  "ca6": "6th Cir.",
  "ca7": "7th Cir.",
  "ca8": "8th Cir.",
  "ca9": "9th Cir.",
  "ca10": "10th Cir.",
  "ca11": "11th Cir.",
  "cadc": "D.C. Cir.",
  "cafc": "Fed. Cir.",
};

function formatCourt(court: string) {
  return COURT_LABELS[court] ?? court.toUpperCase();
}

export function CaseTable() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeType | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCases({
        outcome: outcomeFilter !== "all" ? outcomeFilter : undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setCases(data.cases);
      setTotal(data.total);
    } catch (e) {
      setError("Failed to load cases from backend.");
    } finally {
      setLoading(false);
    }
  }, [outcomeFilter, page]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Reset to page 0 when filter changes
  useEffect(() => {
    setPage(0);
  }, [outcomeFilter]);

  const sorted = [...cases].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const dir = sortDir === "asc" ? 1 : -1;
    return av < bv ? -dir : av > bv ? dir : 0;
  });

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={12} className="text-text-muted opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-accent" />
    ) : (
      <ChevronDown size={12} className="text-accent" />
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Case Explorer</CardTitle>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-text-muted" />
              <span className="text-xs text-text-muted font-mono">
                {loading ? "…" : `${total.toLocaleString()} cases`}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Outcome filter */}
          <div className="flex gap-1 mb-4">
            {OUTCOME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOutcomeFilter(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                  outcomeFilter === opt.value
                    ? "bg-accent text-white"
                    : "bg-surface-elevated text-text-secondary hover:text-text-primary border border-border"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-5">
            {error ? (
              <div className="py-16 text-center text-reversed text-sm">{error}</div>
            ) : loading ? (
              <div className="py-16 text-center text-text-muted text-sm">Loading cases…</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {(
                      [
                        { label: "Case ID", key: "case_id" as SortKey },
                        { label: "Court", key: "court" as SortKey },
                        { label: "Year", key: "year" as SortKey },
                        { label: "Outcome", key: "outcome" as SortKey },
                        { label: "Confidence", key: "label_confidence" as SortKey },
                      ] as { label: string; key: SortKey }[]
                    ).map(({ label, key }) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors whitespace-nowrap"
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          <SortIcon col={key} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c, i) => (
                    <>
                      <tr
                        key={c.case_id}
                        onClick={() => setExpandedId(expandedId === c.case_id ? null : c.case_id)}
                        className={cn(
                          "border-b border-border/50 cursor-pointer group transition-colors",
                          expandedId === c.case_id
                            ? "bg-accent-muted"
                            : "hover:bg-surface-elevated"
                        )}
                      >
                        <td className="px-5 py-3.5">
                          {(() => {
                            const lines = c.snippet.split("\n").filter((l) => l.trim());
                            const titleLine = lines.find((l) => l.includes(" v. "));
                            const displayName = titleLine
                              ? titleLine.slice(0, 60)
                              : `Opinion #${c.case_id}`;
                            return (
                              <>
                                <p className="text-xs font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                                  {displayName}
                                </p>
                                <p className="font-mono text-[10px] text-text-muted mt-0.5">
                                  {c.case_id}
                                </p>
                              </>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-text-secondary text-xs">{formatCourt(c.court)}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs text-text-muted">{c.year}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <OutcomeBadge outcome={c.outcome} />
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className="font-mono text-xs"
                            style={{
                              color:
                                c.label_confidence >= 0.8
                                  ? "#166534"
                                  : c.label_confidence >= 0.6
                                  ? "#92400e"
                                  : "#991b1b",
                            }}
                          >
                            {(c.label_confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                      {expandedId === c.case_id && (
                        <tr key={`${c.case_id}-expanded`}>
                          <td
                            colSpan={5}
                            className="px-5 py-4 bg-surface-elevated border-b border-border"
                          >
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                              Snippet
                            </p>
                            <p className="text-sm text-text-secondary font-legal leading-relaxed">
                              {c.snippet}
                            </p>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && !error && sorted.length === 0 && (
              <div className="py-16 text-center text-text-muted text-sm">
                No cases match your filters.
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="text-xs text-text-muted font-mono">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded border border-border text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded border border-border text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
