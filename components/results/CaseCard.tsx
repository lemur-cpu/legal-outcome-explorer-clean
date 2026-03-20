"use client";

import { motion } from "framer-motion";
import type { CaseResult } from "@/lib/types";

const MONO  = "IBM Plex Mono, monospace";
const SERIF = "IBM Plex Serif, Georgia, serif";

const OUTCOME_COLOR: Record<string, string> = {
  affirmed: "#34d399",
  reversed: "#f87171",
  remanded: "#fbbf24",
  settled:  "#4f8ef7",
};

interface CaseCardProps {
  case: CaseResult;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export function CaseCard({ case: c, isSelected, onClick, index }: CaseCardProps) {
  const accentColor = OUTCOME_COLOR[c.outcome] ?? "#4f8ef7";
  const year        = c.date.slice(0, 4);
  const simPct      = Math.round(c.similarity * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      onClick={onClick}
      className="relative rounded-lg border p-4 mb-2 mx-3 cursor-pointer transition-all duration-200"
      style={{
        background:   "#1a1d27",
        borderColor:  isSelected ? "#4f8ef7" : "#2a2d3a",
        backgroundColor: isSelected ? "rgba(79,142,247,0.06)" : "#1a1d27",
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLDivElement).style.borderColor = "#4f8ef7";
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLDivElement).style.borderColor = "#2a2d3a";
      }}
    >
      {/* Left accent bar — 3px */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ backgroundColor: accentColor }}
      />

      {/* Row 1: title + similarity */}
      <div className="flex items-start justify-between gap-2 mb-2 pl-1">
        <p className="text-[13px] font-semibold text-text-primary leading-snug line-clamp-1 flex-1">
          {c.title}
        </p>
        <span
          className="shrink-0 font-semibold"
          style={{ fontFamily: MONO, fontSize: 12, color: "#4f8ef7" }}
        >
          {simPct}%
        </span>
      </div>

      {/* Row 2: court + year + domain chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2 pl-1">
        {[c.court, year, c.practiceArea].map((label) => (
          <span
            key={label}
            className="px-2 py-0.5 rounded border text-text-muted"
            style={{
              fontFamily:  MONO,
              fontSize:    10,
              borderColor: "#2a2d3a",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Row 3: snippet — IBM Plex Serif italic 12px */}
      <p
        className="line-clamp-2 text-text-muted mb-2 pl-1"
        style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, lineHeight: 1.6 }}
      >
        {c.summary}
      </p>

      {/* Row 4: outcome chip (11px variant) */}
      <div className="pl-1">
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded uppercase"
          style={{
            fontFamily:   MONO,
            fontSize:     11,
            fontWeight:   600,
            letterSpacing: "0.06em",
            color:        accentColor,
            background:   `${accentColor}1a`,
            border:       `1px solid ${accentColor}40`,
          }}
        >
          {c.outcome}
        </span>
      </div>
    </motion.div>
  );
}
