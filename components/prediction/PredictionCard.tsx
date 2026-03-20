"use client";

import { motion } from "framer-motion";
import type { PredictionResult } from "@/lib/types";
import type { OutcomeType } from "@/data/mock";

interface OutcomeBadgeProps {
  outcome: OutcomeType;
}

function OutcomeBadge({ outcome }: OutcomeBadgeProps) {
  const isAffirmed = outcome === "affirmed";
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded text-sm font-mono font-semibold uppercase tracking-widest"
      style={{
        color: isAffirmed ? "#34d399" : "#f87171",
        background: isAffirmed ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
        border: `1px solid ${isAffirmed ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
      }}
    >
      {outcome}
    </span>
  );
}

interface ConfidenceBarProps {
  value: number; // 0–100
  outcome: OutcomeType;
}

function ConfidenceBar({ value, outcome }: ConfidenceBarProps) {
  const color = outcome === "affirmed" ? "#34d399" : "#f87171";
  const colorMid = outcome === "affirmed" ? "#4ade80" : "#fca5a5";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">Confidence</span>
        <span className="font-mono font-semibold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${colorMid})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}

interface PredictionCardProps {
  prediction: PredictionResult;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg bg-surface border border-border p-4 space-y-4"
    >
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
        Prediction
      </p>

      {/* Outcome badge */}
      <div className="flex items-center justify-center py-2">
        <OutcomeBadge outcome={prediction.outcome} />
      </div>

      {/* Confidence bar */}
      <ConfidenceBar value={prediction.confidence} outcome={prediction.outcome} />

      {/* Stat rows */}
      <div className="pt-1 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Cases retrieved</span>
          <span className="font-mono text-text-secondary">{prediction.casesRetrieved}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Avg similarity</span>
          <span className="font-mono text-text-secondary">
            {(prediction.avgSimilarity * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
