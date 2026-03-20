"use client";

import { motion } from "framer-motion";
import type { PredictionResult } from "@/lib/types";
import type { OutcomeType } from "@/data/mock";

const OUTCOME_COLOR: Record<string, string> = {
  affirmed: "#34d399",
  reversed: "#f87171",
  remanded: "#fbbf24",
  settled:  "#4f8ef7",
};

function OutcomeBadge({ outcome }: { outcome: OutcomeType }) {
  const color = OUTCOME_COLOR[outcome] ?? "#4f8ef7";
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded text-[14px] font-bold uppercase tracking-widest"
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        color,
        background: `${color}1f`,       // 12% opacity
        border: `1px solid ${color}4d`, // 30% opacity
      }}
    >
      {outcome}
    </span>
  );
}

function ConfidenceBar({ value, outcome }: { value: number; outcome: OutcomeType }) {
  const outcomeColor = OUTCOME_COLOR[outcome] ?? "#4f8ef7";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-widest">
          Confidence
        </span>
        <span className="text-[11px] font-mono font-semibold" style={{ color: outcomeColor }}>
          {value}%
        </span>
      </div>
      {/* Track */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#21253a" }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, #4f8ef7, ${outcomeColor})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        />
      </div>
    </div>
  );
}

export function PredictionCard({ prediction }: { prediction: PredictionResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg bg-surface border border-border p-4 space-y-4"
    >
      <p className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">
        Prediction
      </p>

      {/* Outcome badge — centered */}
      <div className="flex items-center justify-center py-1">
        <OutcomeBadge outcome={prediction.outcome} />
      </div>

      {/* Confidence bar */}
      <ConfidenceBar value={prediction.confidence} outcome={prediction.outcome} />

      {/* Stat rows */}
      <div className="border-t border-border pt-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
            Cases Retrieved
          </span>
          <span className="text-[11px] font-mono text-text-secondary font-medium">
            {prediction.casesRetrieved}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
            Avg Similarity
          </span>
          <span className="text-[11px] font-mono text-text-secondary font-medium">
            {(prediction.avgSimilarity * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
