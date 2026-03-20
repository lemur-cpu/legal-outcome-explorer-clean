"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ShapValue } from "@/lib/types";

const POSITIVE_COLOR = "#4f8ef7";
const NEGATIVE_COLOR = "#f87171";

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  feature: string;
  direction: string;
  value: number;
}

interface FeatureImportanceChartProps {
  shapValues: ShapValue[];
}

export function FeatureImportanceChart({ shapValues }: FeatureImportanceChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    feature: "",
    direction: "",
    value: 0,
  });

  const top6 = shapValues.slice(0, 6);
  const maxAbs = Math.max(...top6.map((s) => Math.abs(s.value)), 0.01);

  function handleMouseEnter(
    e: React.MouseEvent<HTMLDivElement>,
    shap: ShapValue
  ) {
    const rect = (e.currentTarget as HTMLDivElement)
      .closest(".shap-container")
      ?.getBoundingClientRect();
    const self = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: self.right - (rect?.left ?? 0) + 8,
      y: self.top - (rect?.top ?? 0),
      feature: shap.feature,
      direction: shap.direction,
      value: shap.value,
    });
  }

  function handleMouseLeave() {
    setTooltip((t) => ({ ...t, visible: false }));
  }

  return (
    <div className="rounded-lg bg-surface border border-border p-4">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
        Feature Importance
      </p>

      <div className="shap-container relative space-y-3">
        {top6.map((shap, i) => {
          const color = shap.direction === "positive" ? POSITIVE_COLOR : NEGATIVE_COLOR;
          const widthPct = (Math.abs(shap.value) / maxAbs) * 100;

          return (
            <div key={shap.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary truncate max-w-[160px]">
                  {shap.feature}
                </span>
                <span
                  className="font-mono text-[11px] ml-2 shrink-0"
                  style={{ color }}
                >
                  {shap.direction === "positive" ? "+" : ""}
                  {shap.value.toFixed(2)}
                </span>
              </div>

              {/* Bar track */}
              <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full cursor-pointer"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: i * 0.06,
                  }}
                  onMouseEnter={(e) =>
                    handleMouseEnter(
                      e as unknown as React.MouseEvent<HTMLDivElement>,
                      shap
                    )
                  }
                  onMouseLeave={handleMouseLeave}
                />
              </div>
            </div>
          );
        })}

        {/* Tooltip */}
        {tooltip.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-10 px-2.5 py-2 rounded bg-surface-elevated border border-border shadow-card text-xs pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <p className="font-medium text-text-primary mb-0.5">{tooltip.feature}</p>
            <p className="text-text-muted">
              Direction:{" "}
              <span
                style={{
                  color:
                    tooltip.direction === "positive"
                      ? POSITIVE_COLOR
                      : NEGATIVE_COLOR,
                }}
              >
                {tooltip.direction}
              </span>
            </p>
            <p className="font-mono text-text-secondary">
              Value: {tooltip.value > 0 ? "+" : ""}
              {tooltip.value.toFixed(3)}
            </p>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-4 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: POSITIVE_COLOR }} />
          Toward affirmed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: NEGATIVE_COLOR }} />
          Toward reversed
        </span>
      </div>
    </div>
  );
}
