"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react";
import { MOCK_CASES, Case, OutcomeType } from "@/data/mock";
import { OutcomeBadge, Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OUTCOME_OPTIONS: { label: string; value: OutcomeType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Affirmed", value: "affirmed" },
  { label: "Reversed", value: "reversed" },
  { label: "Remanded", value: "remanded" },
  { label: "Settled", value: "settled" },
];

export function CaseTable() {
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeType | "all">("all");
  const [sortKey, setSortKey] = useState<keyof Case>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = MOCK_CASES.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.citation.toLowerCase().includes(search.toLowerCase()) ||
      c.judge.toLowerCase().includes(search.toLowerCase()) ||
      c.practiceArea.toLowerCase().includes(search.toLowerCase());
    const matchesOutcome =
      outcomeFilter === "all" || c.outcome === outcomeFilter;
    return matchesSearch && matchesOutcome;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] as string | number;
    const bv = b[sortKey] as string | number;
    const dir = sortDir === "asc" ? 1 : -1;
    return av < bv ? -dir : av > bv ? dir : 0;
  });

  function toggleSort(key: keyof Case) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: keyof Case }) {
    if (sortKey !== col) return <ChevronDown size={12} className="text-text-muted opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-accent" />
    ) : (
      <ChevronDown size={12} className="text-accent" />
    );
  }

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
              <span className="text-xs text-text-muted font-mono">{sorted.length} results</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search cases, citations, judges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-elevated border border-border rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <div className="flex gap-1">
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
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { label: "Case", key: "title" as keyof Case },
                    { label: "Court", key: "court" as keyof Case },
                    { label: "Area", key: "practiceArea" as keyof Case },
                    { label: "Outcome", key: "outcome" as keyof Case },
                    { label: "Conf.", key: "confidenceScore" as keyof Case },
                    { label: "Prec.", key: "precedentStrength" as keyof Case },
                    { label: "Date", key: "date" as keyof Case },
                  ].map(({ label, key }) => (
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
                <AnimatePresence initial={false}>
                  {sorted.map((c, i) => (
                    <>
                      <motion.tr
                        key={c.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        className={cn(
                          "border-b border-border/50 cursor-pointer group transition-colors",
                          expandedId === c.id
                            ? "bg-accent-muted"
                            : "hover:bg-surface-elevated"
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                              {c.title}
                            </p>
                            <p className="text-xs text-text-muted font-mono mt-0.5">{c.citation}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-text-secondary text-xs">{c.court}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <Badge variant="secondary">{c.practiceArea}</Badge>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <OutcomeBadge outcome={c.outcome} />
                        </td>
                        <td className="px-5 py-3.5">
                          <ScoreRing score={c.confidenceScore} size={40} strokeWidth={3} />
                        </td>
                        <td className="px-5 py-3.5">
                          <ScoreRing score={c.precedentStrength} size={40} strokeWidth={3} />
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-xs text-text-muted font-mono">
                            {new Date(c.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {expandedId === c.id && (
                          <motion.tr
                            key={`${c.id}-expanded`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td colSpan={7} className="px-5 py-4 bg-surface-elevated border-b border-border">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                                    Summary
                                  </p>
                                  <p className="text-sm text-text-secondary font-legal leading-relaxed">
                                    {c.summary}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    {c.tags.map((tag) => (
                                      <Badge key={tag} variant="outline">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                                    Details
                                  </p>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-text-muted">Judge</span>
                                    <span className="text-text-secondary">{c.judge}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-text-muted">Citations</span>
                                    <span className="font-mono text-accent">{c.citationCount}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-text-muted">Confidence</span>
                                    <span className="font-mono text-affirmed">{c.confidenceScore}/100</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-text-muted">Precedent</span>
                                    <span className="font-mono text-highlight">{c.precedentStrength}/100</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {sorted.length === 0 && (
              <div className="py-16 text-center text-text-muted text-sm">
                No cases match your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
