"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { PredictionResult, OutcomeType } from "@/lib/types";

const MONO = "IBM Plex Mono, monospace";

// Muted academic palette — matches CaseViewer badges
const OUTCOME: Record<string, { text: string; bg: string; border: string; bar: string }> = {
  affirmed: { text: "#166534", bg: "#dcfce7", border: "#86efac", bar: "#166534" },
  reversed: { text: "#991b1b", bg: "#fee2e2", border: "#fca5a5", bar: "#991b1b" },
  remanded: { text: "#92400e", bg: "#fef3c7", border: "#fcd34d", bar: "#92400e" },
  settled:  { text: "#1a4b8c", bg: "#e8eef7", border: "#93c5fd", bar: "#1a4b8c" },
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
        fontFamily:    MONO,
        fontSize:      14,
        fontWeight:    700,
        letterSpacing: "0.08em",
        padding:       "6px 12px",
        borderRadius:  6,
        color:         c.text,
        background:    c.bg,
        border:        `1px solid ${c.border}`,
      }}
    >
      {outcome}
    </motion.span>
  );
}

// ─── ConfidenceBar ───────────────────────────────────────────────────────────
function ConfidenceBar({ confidence, outcome }: { confidence: number; outcome: OutcomeType }) {
  const barColor = (OUTCOME[outcome] ?? OUTCOME.settled).bar;
  const pct = Math.round(confidence * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span
          className="text-[12px] uppercase tracking-widest"
          style={{ fontFamily: MONO, color: "#a8a29e" }}
        >
          Confidence
        </span>
        <span
          className="text-[12px] font-semibold"
          style={{ fontFamily: MONO, color: barColor }}
        >
          {pct}%
        </span>
      </div>
      {/* Track — warm gray */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 6, background: "#e2ddd6" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #1a4b8c, ${barColor})` }}
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
  return <div className="shimmer rounded" style={{ width: w, height: h }} />;
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
      <div className="pt-3 space-y-2.5" style={{ borderTop: "1px solid #e2ddd6" }}>
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
      className="rounded-lg border p-4"
      style={{ background: "#f8f6f1", borderColor: "#e2ddd6" }}
    >
      <p
        className="text-[10px] uppercase tracking-widest mb-4"
        style={{ fontFamily: MONO, color: "#a8a29e" }}
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
            <div className="flex justify-center py-1">
              <OutcomeBadge outcome={prediction.outcome} />
            </div>

            <ConfidenceBar confidence={prediction.confidence} outcome={prediction.outcome} />

            <div className="pt-3 space-y-2.5" style={{ borderTop: "1px solid #e2ddd6" }}>
              {[
                { label: "Cases Retrieved", value: String(prediction.casesRetrieved) },
                { label: "Avg Similarity",  value: `${(prediction.avgSimilarity * 100).toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span
                    className="text-[11px] uppercase tracking-wider"
                    style={{ fontFamily: MONO, color: "#a8a29e" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ fontFamily: MONO, color: "#1c1917" }}
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
            className="h-32 flex items-center justify-center text-sm rounded border border-dashed"
            style={{ color: "#a8a29e", borderColor: "#e2ddd6" }}
          >
            Submit a query to see prediction
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
