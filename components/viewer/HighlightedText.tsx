"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HighlightSpan } from "@/lib/types";

interface HighlightedTextProps {
  text: string;
  spans: HighlightSpan[];
}

interface TooltipState {
  visible: boolean;
  reason: string;
  x: number;
  y: number;
}

export function HighlightedText({ text, spans }: HighlightedTextProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    reason: "",
    x: 0,
    y: 0,
  });

  // Build a list of plain + highlighted segments from the span list
  type Segment =
    | { type: "plain"; text: string }
    | { type: "highlight"; text: string; reason: string };

  const segments: Segment[] = [];
  // Sort spans by start position, deduplicate overlaps simply by taking first
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  let cursor = 0;

  for (const span of sorted) {
    if (span.start > cursor) {
      segments.push({ type: "plain", text: text.slice(cursor, span.start) });
    }
    const end = Math.min(span.end, text.length);
    if (end > span.start) {
      segments.push({ type: "highlight", text: text.slice(span.start, end), reason: span.reason });
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < text.length) {
    segments.push({ type: "plain", text: text.slice(cursor) });
  }

  function handleMouseEnter(e: React.MouseEvent, reason: string) {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = (e.currentTarget as HTMLElement)
      .closest(".highlighted-container")
      ?.getBoundingClientRect();
    setTooltip({
      visible: true,
      reason,
      x: rect.left - (container?.left ?? 0),
      y: rect.bottom - (container?.top ?? 0) + 6,
    });
  }

  function handleMouseLeave() {
    setTooltip((t) => ({ ...t, visible: false }));
  }

  return (
    <div className="highlighted-container relative">
      <p className="text-sm text-text-secondary font-legal leading-relaxed">
        {segments.map((seg, i) =>
          seg.type === "plain" ? (
            <span key={i}>{seg.text}</span>
          ) : (
            <span
              key={i}
              className="cursor-help"
              style={{
                backgroundColor: "rgba(251, 191, 36, 0.25)",
                borderBottom: "1px solid #fbbf24",
                borderRadius: "2px",
                padding: "0 2px",
              }}
              onMouseEnter={(e) => handleMouseEnter(e, seg.reason)}
              onMouseLeave={handleMouseLeave}
            >
              {seg.text}
            </span>
          )
        )}
      </p>

      <AnimatePresence>
        {tooltip.visible && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 max-w-[220px] px-2.5 py-2 rounded bg-surface-elevated border border-border shadow-card text-xs text-text-secondary pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.reason}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
