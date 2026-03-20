"use client";

import { CaseCard } from "./CaseCard";
import type { CaseResult } from "@/lib/types";

interface ResultsListProps {
  results: CaseResult[];
  onSelect: (c: CaseResult) => void;
  selectedId: string | null;
}

export function ResultsList({ results, onSelect, selectedId }: ResultsListProps) {
  return (
    <div className="pt-3 pb-4">
      {/* Header count */}
      <p
        className="px-4 mb-3 text-text-muted"
        style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11 }}
      >
        {results.length} precedent{results.length !== 1 ? "s" : ""} found
      </p>

      {results.map((c, i) => (
        <CaseCard
          key={c.id}
          case={c}
          index={i}
          isSelected={selectedId === c.id}
          onClick={() => onSelect(c)}
        />
      ))}
    </div>
  );
}
