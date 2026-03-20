"use client";

import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#4f8ef7";
  if (score >= 40) return "#fbbf24";
  return "#f87171";
}

export function ScoreRing({
  score,
  size = 56,
  strokeWidth = 4,
  label,
}: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2a2d3e"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-mono font-semibold text-sm"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {label && (
        <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
}
