"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CaseCard } from "./CaseCard";
import type { CaseResult } from "@/lib/types";

interface ResultsListProps {
  results: CaseResult[];
  selectedId: string | null;
  onSelect: (result: CaseResult) => void;
}

export function ResultsList({ results, selectedId, onSelect }: ResultsListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Results
        </p>
        <span className="text-xs font-mono text-text-muted">
          {results.length} case{results.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {results.map((result, i) => (
            <CaseCard
              key={result.id}
              result={result}
              index={i}
              selected={selectedId === result.id}
              onClick={() => onSelect(result)}
            />
          ))}
        </AnimatePresence>

        {results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-32 text-text-muted text-sm"
          >
            No results
          </motion.div>
        )}
      </div>
    </div>
  );
}
