"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CaseResult } from "@/lib/types";

const OUTCOME_ACCENT: Record<string, string> = {
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
  const accentColor = OUTCOME_ACCENT[result.outcome] ?? "#4f8ef7";
  const year = result.date.slice(0, 4);
  const similarityPct = Math.round(result.similarity * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
      onClick={onClick}
      className={cn(
        "relative flex gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-border/50",
        selected ? "bg-accent-muted" : "hover:bg-surface-elevated"
      )}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title */}
        <p className={cn(
          "text-sm font-medium leading-snug line-clamp-1 transition-colors",
          selected ? "text-accent" : "text-text-primary"
        )}>
          {result.title}
        </p>

        {/* Snippet */}
        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
          {result.summary}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-text-secondary border border-border">
            {result.court}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-text-secondary border border-border">
            {year}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-text-secondary border border-border">
            {result.practiceArea}
          </span>
        </div>
      </div>

      {/* Similarity score */}
      <div className="shrink-0 flex flex-col items-end justify-between py-0.5">
        <span
          className="text-xs font-mono font-semibold"
          style={{ color: accentColor }}
        >
          {similarityPct}%
        </span>
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase"
          style={{
            color: accentColor,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {result.outcome}
        </span>
      </div>
    </motion.div>
  );
}
