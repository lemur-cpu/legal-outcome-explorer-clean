"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShapValue } from "@/lib/types";

const POS = "#4f8ef7";
const NEG = "#f87171";

export function FeatureImportanceChart({ shapValues }: { shapValues: ShapValue[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const top6 = shapValues.slice(0, 6);
  const maxAbs = Math.max(...top6.map((s) => Math.abs(s.value)), 0.01);

  return (
    <div className="rounded-lg bg-surface border border-border p-4">
      {/* Section label */}
      <p className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-[0.12em] mb-4">
        Prediction Factors
      </p>

      <div className="space-y-1">
        {top6.map((shap, i) => {
          const color    = shap.direction === "positive" ? POS : NEG;
          const widthPct = (Math.abs(shap.value) / maxAbs) * 100;
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={shap.feature}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative rounded px-1 py-1.5 transition-colors"
              style={{ background: isHovered ? "rgba(79,142,247,0.06)" : "transparent" }}
            >
              <div className="flex items-center gap-2">
                {/* Feature name — fixed 140px */}
                <span
                  className="text-[11px] text-text-secondary truncate shrink-0"
                  style={{ width: 140 }}
                >
                  {shap.feature}
                </span>

                {/* Bar track — flex-1, 4px tall */}
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#21253a" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.06 }}
                  />
                </div>

                {/* Value — fixed 40px, right-aligned */}
                <span
                  className="text-[11px] font-mono shrink-0 text-right"
                  style={{ width: 40, color }}
                >
                  {shap.direction === "positive" ? "+" : ""}
                  {shap.value.toFixed(2)}
                </span>
              </div>

              {/* Hover tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    key="tip"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-[148px] -top-7 z-20 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap pointer-events-none border border-border shadow-card"
                    style={{ background: "#21253a", color }}
                  >
                    {shap.direction === "positive" ? "↑ toward affirmed" : "↓ toward reversed"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-[10px] font-mono text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-1 rounded-full inline-block" style={{ backgroundColor: POS }} />
          affirmed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-1 rounded-full inline-block" style={{ backgroundColor: NEG }} />
          reversed
        </span>
      </div>
    </div>
  );
}
