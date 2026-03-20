"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShapValue } from "@/lib/types";

const MONO = "IBM Plex Mono, monospace";
const POS  = "#4f8ef7";
const NEG  = "#f87171";

// ─── Shimmer skeleton rows ───────────────────────────────────────────────────
function ShapSkeleton() {
  const widths = [68, 55, 80, 44, 62, 50];
  return (
    <div className="space-y-3">
      {widths.map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="shimmer rounded" style={{ width: 140, height: 11 }} />
          <div className="flex-1 h-1.5 shimmer rounded-full" />
          <div className="shimmer rounded" style={{ width: 36, height: 11 }} />
        </div>
      ))}
    </div>
  );
}

// ─── FeatureImportanceChart ──────────────────────────────────────────────────
interface Props {
  shapValues: ShapValue[];
  isLoading?: boolean;
}

export function FeatureImportanceChart({ shapValues, isLoading = false }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const top6   = shapValues.slice(0, 6);
  const maxAbs = Math.max(...top6.map((s) => Math.abs(s.value)), 0.01);

  return (
    <div
      className="rounded-lg border border-border p-4"
      style={{ background: "#1a1d27" }}
    >
      {/* Header */}
      <p
        className="text-[10px] uppercase text-text-muted mb-3"
        style={{ fontFamily: MONO, letterSpacing: "0.12em" }}
      >
        Prediction Factors
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
            <ShapSkeleton />
          </motion.div>
        ) : top6.length > 0 ? (
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-0.5"
          >
            {top6.map((shap, i) => {
              const color    = shap.direction === "positive" ? POS : NEG;
              const widthPct = (Math.abs(shap.value) / maxAbs) * 100;
              const isHov    = hoveredIdx === i;
              const toward   = shap.direction === "positive" ? "AFFIRMANCE" : "REVERSAL";

              return (
                <div
                  key={shap.feature}
                  className="relative flex items-center gap-2 py-1 px-2 rounded transition-colors cursor-default"
                  style={{ background: isHov ? "rgba(42,45,58,0.6)" : "transparent" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {isHov && (
                      <motion.div
                        key="tip"
                        initial={{ opacity: 0, scale: 0.9, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.12 }}
                        className="absolute bottom-full left-2 mb-1.5 z-20 px-2 py-1 rounded border whitespace-nowrap pointer-events-none"
                        style={{
                          background:  "#1a1d27",
                          borderColor: "#2a2d3a",
                          fontFamily:  MONO,
                          fontSize:    11,
                          color:       color,
                        }}
                      >
                        {shap.feature} pushing toward {toward}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Feature name — 140px fixed */}
                  <span
                    className="truncate text-text-primary"
                    style={{ minWidth: 140, width: 140, fontSize: 12 }}
                  >
                    {shap.feature}
                  </span>

                  {/* Bar track */}
                  <div
                    className="flex-1 rounded-full relative"
                    style={{ height: 6, background: "#2a2d3a" }}
                  >
                    <motion.div
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
                    />
                  </div>

                  {/* Value — 40px right-aligned */}
                  <span
                    className="text-right text-text-muted"
                    style={{ width: 40, fontFamily: MONO, fontSize: 11 }}
                  >
                    {shap.direction === "positive" ? "+" : ""}
                    {shap.value.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-40 flex items-center justify-center text-text-muted text-sm border border-dashed border-border rounded"
          >
            SHAP values will appear here
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
