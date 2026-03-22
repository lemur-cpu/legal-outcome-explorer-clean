"use client";

import { motion } from "framer-motion";
import type { CaseResult } from "@/lib/types";

const MONO  = "IBM Plex Mono, monospace";
const SERIF = "IBM Plex Serif, Georgia, serif";

// Muted academic outcome colors
const OUTCOME_COLOR: Record<string, string> = {
  affirmed: "#166534",
  reversed: "#991b1b",
  remanded: "#92400e",
  settled:  "#1a4b8c",
};

const OUTCOME_BG: Record<string, string> = {
  affirmed: "#dcfce7",
  reversed: "#fee2e2",
  remanded: "#fef3c7",
  settled:  "#e8eef7",
};

const OUTCOME_BORDER: Record<string, string> = {
  affirmed: "#86efac",
  reversed: "#fca5a5",
  remanded: "#fcd34d",
  settled:  "#93c5fd",
};

interface CaseCardProps {
  case: CaseResult;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export function CaseCard({ case: c, isSelected, onClick, index }: CaseCardProps) {
  const accentColor  = OUTCOME_COLOR[c.outcome] ?? OUTCOME_COLOR.settled;
  const badgeBg      = OUTCOME_BG[c.outcome]    ?? OUTCOME_BG.settled;
  const badgeBorder  = OUTCOME_BORDER[c.outcome] ?? OUTCOME_BORDER.settled;
  const year         = c.date.slice(0, 4);
  // similarity is already a scaled percentage value (e.g. 1.0 = 1%, 72.5 = 72.5%)
  const simPct       = Math.round(c.similarity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      onClick={onClick}
      className="relative rounded-lg border p-4 mb-2 mx-3 cursor-pointer transition-all duration-200"
      style={{
        background:   isSelected ? "#f0ede6" : "#ffffff",
        borderColor:  isSelected ? "#1a4b8c" : "#e2ddd6",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.background    = "#f0ede6";
          (e.currentTarget as HTMLDivElement).style.borderColor   = "#1a4b8c";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.background    = "#ffffff";
          (e.currentTarget as HTMLDivElement).style.borderColor   = "#e2ddd6";
        }
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ backgroundColor: accentColor }}
      />

      {/* Row 1: title + similarity */}
      <div className="flex items-start justify-between gap-2 mb-2 pl-1">
        <p
          className="text-[13px] font-semibold leading-snug line-clamp-1 flex-1"
          style={{ color: "#1c1917" }}
        >
          {c.title}
        </p>
        <span
          className="shrink-0 font-semibold"
          style={{ fontFamily: MONO, fontSize: 12, color: "#1a4b8c" }}
        >
          {simPct}% match
        </span>
      </div>

      {/* Row 2: court + year + domain chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2 pl-1">
        {[c.court, year, c.practiceArea].map((label) => (
          <span
            key={label}
            className="px-2 py-0.5 rounded border"
            style={{ fontFamily: MONO, fontSize: 10, borderColor: "#e2ddd6", color: "#a8a29e" }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Row 3: snippet — IBM Plex Serif italic */}
      <p
        className="line-clamp-2 mb-2 pl-1"
        style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, lineHeight: 1.6, color: "#57534e" }}
      >
        {c.summary}
      </p>

      {/* Row 4: outcome chip */}
      <div className="pl-1">
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded uppercase"
          style={{
            fontFamily:    MONO,
            fontSize:      11,
            fontWeight:    600,
            letterSpacing: "0.06em",
            color:         accentColor,
            background:    badgeBg,
            border:        `1px solid ${badgeBorder}`,
          }}
        >
          {c.outcome}
        </span>
      </div>
    </motion.div>
  );
}
