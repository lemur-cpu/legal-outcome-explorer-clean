"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { PredictionResult } from "@/lib/types";
import type { OutcomeType } from "@/data/mock";

// ─── colours ────────────────────────────────────────────────────────────────
const OUTCOME: Record<string, { text: string; bg: string; border: string }> = {
  affirmed: {
    text:   "#34d399",
    bg:     "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.3)",
  },
  reversed: {
    text:   "#f87171",
    bg:     "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.3)",
  },
  remanded: {
    text:   "#fbbf24",
    bg:     "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.3)",
  },
  settled: {
    text:   "#4f8ef7",
    bg:     "rgba(79,142,247,0.12)",
    border: "rgba(79,142,247,0.3)",
  },
};

// ─── OutcomeBadge ────────────────────────────────────────────────────────────
function OutcomeBadge({ outcome }: { outcome: OutcomeType }) {
  const c = OUTCOME[outcome] ?? OUTCOME.settled;
  return (
    <motion.span
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1,    opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="inline-flex items-center uppercase"
      style={{
        fontFamily:   "Inter, system-ui, sans-serif",
        fontSize:     14,
        fontWeight:   700,
        letterSpacing: "0.08em",
        padding:      "6px 12px",
        borderRadius: 6,
        color:        c.text,
        background:   c.bg,
        border:       `1px solid ${c.border}`,
      }}
    >
      {outcome}
    </motion.span>
  );
}

// ─── ConfidenceBar ───────────────────────────────────────────────────────────
function ConfidenceBar({
  confidence,
  outcome,
}: {
  confidence: number; // 0–1
  outcome: OutcomeType;
}) {
  const outcomeColor = (OUTCOME[outcome] ?? OUTCOME.settled).text;
  const pct = Math.round(confidence * 100);

  return (
    <div className="space-y-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span
          className="text-[12px] uppercase tracking-widest text-text-muted"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          Confidence
        </span>
        <span
          className="text-[12px] font-semibold"
          style={{ fontFamily: "IBM Plex Mono, monospace", color: outcomeColor }}
        >
          {pct}%
        </span>
      </div>
      {/* Track */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 6, background: "#2a2d3a" }}
      >
        {/* Fill — inline style for dynamic gradient */}
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, #4f8ef7, ${outcomeColor})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Shimmer skeleton ────────────────────────────────────────────────────────
function Skeleton({ w, h }: { w: string; h: number }) {
  return (
    <div
      className="shimmer rounded"
      style={{ width: w, height: h }}
    />
  );
}

function PredictionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton w="60%" h={12} />
      <div className="flex justify-center py-1">
        <Skeleton w="40%" h={32} />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <Skeleton w="45%" h={11} />
          <Skeleton w="18%" h={11} />
        </div>
        <Skeleton w="100%" h={6} />
      </div>
      <div className="border-t border-border pt-3 space-y-2.5">
        <div className="flex justify-between">
          <Skeleton w="50%" h={11} />
          <Skeleton w="12%" h={11} />
        </div>
        <div className="flex justify-between">
          <Skeleton w="42%" h={11} />
          <Skeleton w="20%" h={11} />
        </div>
      </div>
    </div>
  );
}

// ─── PredictionCard ──────────────────────────────────────────────────────────
interface PredictionCardProps {
  prediction: PredictionResult | null;
  isLoading: boolean;
}

export function PredictionCard({ prediction, isLoading }: PredictionCardProps) {
  return (
    <div
      className="rounded-lg border border-border p-4"
      style={{ background: "#1a1d27" }}
    >
      <p
        className="text-[10px] uppercase tracking-widest text-text-muted mb-4"
        style={{ fontFamily: "IBM Plex Mono, monospace" }}
      >
        Prediction
      </p>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <PredictionSkeleton />
          </motion.div>
        ) : prediction ? (
          <motion.div
            key={`${prediction.outcome}-${prediction.confidence}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Badge */}
            <div className="flex justify-center py-1">
              <OutcomeBadge outcome={prediction.outcome} />
            </div>

            {/* Confidence bar */}
            <ConfidenceBar
              confidence={prediction.confidence}
              outcome={prediction.outcome}
            />

            {/* Stats */}
            <div className="border-t border-border pt-3 space-y-2.5">
              {[
                { label: "Cases Retrieved", value: String(prediction.casesRetrieved) },
                {
                  label: "Avg Similarity",
                  value: `${(prediction.avgSimilarity * 100).toFixed(1)}%`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span
                    className="text-[11px] uppercase tracking-wider text-text-muted"
                    style={{ fontFamily: "IBM Plex Mono, monospace" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[11px] text-text-primary font-medium"
                    style={{ fontFamily: "IBM Plex Mono, monospace" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-32 flex items-center justify-center text-text-muted text-sm border border-dashed border-border rounded"
          >
            Submit a query to see prediction
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
