"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { RealAnalyticsData } from "@/lib/types";

const COURT_LABELS: Record<string, string> = {
  ca1: "1st Circuit",
  ca2: "2nd Circuit",
  ca3: "3rd Circuit",
  ca4: "4th Circuit",
  ca5: "5th Circuit",
  ca6: "6th Circuit",
  ca7: "7th Circuit",
  ca8: "8th Circuit",
  ca9: "9th Circuit",
  ca10: "10th Circuit",
  ca11: "11th Circuit",
  cadc: "D.C. Circuit",
  cafc: "Federal Circuit",
};

interface JudgePanelProps {
  data?: RealAnalyticsData;
}

export function JudgePanel({ data }: JudgePanelProps) {
  const minYear = data?.by_year?.length
    ? Math.min(...data.by_year.map((y) => y.year))
    : null;
  const maxYear = data?.by_year?.length
    ? Math.max(...data.by_year.map((y) => y.year))
    : null;

  const stats = data
    ? [
        {
          label: "Total Opinions",
          value: data.total_cases.toLocaleString(),
        },
        {
          label: "Date Range",
          value: minYear && maxYear ? `${minYear}–${maxYear}` : "—",
        },
        {
          label: "Avg Opinion Length",
          value: data.avg_opinion_tokens
            ? `${data.avg_opinion_tokens.toLocaleString()} tokens`
            : "—",
        },
        {
          label: "Avg Label Confidence",
          value: data.avg_label_confidence
            ? `${(data.avg_label_confidence * 100).toFixed(1)}%`
            : "—",
        },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Corpus Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data ? (
            <p className="text-sm text-text-muted">Loading corpus stats…</p>
          ) : (
            <>
              {/* Key stats */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="p-3 rounded-lg bg-surface-elevated border border-border/60"
                  >
                    <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">
                      {s.label}
                    </p>
                    <p className="font-mono text-sm text-text-primary">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Courts list */}
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                  Circuits Covered
                </p>
                <div className="space-y-1.5">
                  {data.by_court.map((c, i) => (
                    <motion.div
                      key={c.court}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: 0.5 + i * 0.05 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-text-secondary">
                        {COURT_LABELS[c.court] ?? c.court.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: "#1a4b8c" }}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.round((c.count / data.total_cases) * 100)}%`,
                            }}
                            transition={{ duration: 0.7, ease: "easeOut", delay: 0.6 + i * 0.05 }}
                          />
                        </div>
                        <span className="font-mono text-text-muted w-8 text-right">
                          {c.count}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
