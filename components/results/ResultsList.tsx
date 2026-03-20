"use client";

import { AnimatePresence } from "framer-motion";
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
      {/* Count row */}
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <span className="text-[11px] font-mono text-text-muted">
          {results.length} precedent{results.length !== 1 ? "s" : ""} found
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
      </div>
    </div>
  );
}
