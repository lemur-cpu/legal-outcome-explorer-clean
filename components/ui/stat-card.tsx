"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  accent?: "blue" | "green" | "red" | "yellow";
  delay?: number;
}

const accentMap = {
  blue: { bg: "bg-accent-muted", text: "text-accent", icon: "text-accent" },
  green: { bg: "bg-affirmed-muted", text: "text-affirmed", icon: "text-affirmed" },
  red: { bg: "bg-reversed-muted", text: "text-reversed", icon: "text-reversed" },
  yellow: { bg: "bg-highlight-muted", text: "text-highlight", icon: "text-highlight" },
};

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  accent = "blue",
  delay = 0,
}: StatCardProps) {
  const colors = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg bg-surface border border-border p-5 shadow-card"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {label}
        </p>
        {Icon && (
          <div className={cn("p-1.5 rounded", colors.bg)}>
            <Icon size={14} className={colors.icon} />
          </div>
        )}
      </div>
      <p className={cn("text-2xl font-mono font-semibold", colors.text)}>
        {value}
      </p>
      {(delta !== undefined || deltaLabel) && (
        <p className="mt-1.5 text-xs text-text-muted">
          {delta !== undefined && (
            <span className={delta >= 0 ? "text-affirmed" : "text-reversed"}>
              {delta >= 0 ? "+" : ""}{delta}
            </span>
          )}
          {deltaLabel && (
            <span className="ml-1">{deltaLabel}</span>
          )}
        </p>
      )}
    </motion.div>
  );
}
