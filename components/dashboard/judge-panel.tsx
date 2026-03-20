"use client";

import { motion } from "framer-motion";
import { JUDGE_STATS } from "@/data/mock";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function JudgeBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-muted">{label}</span>
        <span className="font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export function JudgePanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Judge Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {JUDGE_STATS.map((judge, i) => (
            <motion.div
              key={judge.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
              className="p-3 rounded-lg bg-surface-elevated border border-border/50 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{judge.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{judge.court}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-accent">{judge.totalCases.toLocaleString()}</p>
                  <p className="text-xs text-text-muted">cases</p>
                </div>
              </div>
              <div className="space-y-2">
                <JudgeBar label="Affirm Rate" value={judge.affirmRate} color="#34d399" />
                <JudgeBar label="Reversal Rate" value={judge.reversalRate} color="#f87171" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-wrap gap-1">
                  {judge.practiceAreas.slice(0, 2).map((area) => (
                    <span
                      key={area}
                      className="px-1.5 py-0.5 rounded bg-accent-muted text-accent text-[10px]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
                <span className="text-text-muted font-mono">{judge.avgDecisionDays}d avg</span>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
