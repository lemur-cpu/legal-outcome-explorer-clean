"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CaseResult } from "@/lib/types";

const OUTCOME_COLOR: Record<string, string> = {
  affirmed: "#34d399",
  reversed: "#f87171",
  remanded: "#fbbf24",
  settled:  "#4f8ef7",
};

interface CaseCardProps {
  result: CaseResult;
  index: number;
  selected: boolean;
  onClick: () => void;
}

export function CaseCard({ result, index, selected, onClick }: CaseCardProps) {
  const color       = OUTCOME_COLOR[result.outcome] ?? "#4f8ef7";
  const year        = result.date.slice(0, 4);
  const similarityPct = Math.round(result.similarity * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        "relative pl-4 pr-4 py-3.5 cursor-pointer border-b border-border/50 transition-colors",
        selected ? "bg-accent-muted" : "hover:bg-surface-elevated"
      )}
    >
      {/* Left accent bar — 3px */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
        style={{ backgroundColor: color }}
      />

      {/* Row 1: title + similarity */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className={cn(
          "text-[13px] font-medium leading-snug line-clamp-1 transition-colors",
          selected ? "text-accent" : "text-text-primary"
        )}>
          {result.title}
        </p>
        <span className="text-[11px] font-mono font-semibold shrink-0" style={{ color: "#4f8ef7" }}>
          {similarityPct}%
        </span>
      </div>

      {/* Row 2: court + year + domain badges */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {[result.court, year, result.practiceArea].map((label) => (
          <span
            key={label}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-text-muted border border-border bg-surface-elevated"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Row 3: 2-line snippet in IBM Plex Serif italic */}
      <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2 font-legal italic mb-2">
        {result.summary}
      </p>

      {/* Row 4: outcome chip */}
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider"
        style={{
          color,
          background: `${color}18`,
          border: `1px solid ${color}33`,
        }}
      >
        {result.outcome}
      </span>
    </motion.div>
  );
}
