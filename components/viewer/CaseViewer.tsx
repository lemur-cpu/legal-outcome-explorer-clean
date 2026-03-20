"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HighlightedText } from "./HighlightedText";
import type { CaseResult } from "@/lib/types";

const OUTCOME_COLOR: Record<string, string> = {
  affirmed: "#34d399",
  reversed: "#f87171",
  remanded: "#fbbf24",
  settled:  "#4f8ef7",
};

interface CaseViewerProps {
  selectedCase: CaseResult | null;
}

export function CaseViewer({ selectedCase }: CaseViewerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel label */}
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Case Viewer
        </p>
      </div>

      <AnimatePresence mode="wait">
        {selectedCase ? (
          <motion.div
            key={selectedCase.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 overflow-y-auto"
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 px-4 py-3 bg-surface/95 backdrop-blur-md border-b border-border space-y-2">
              <p className="text-sm font-semibold text-text-primary leading-snug">
                {selectedCase.title}
              </p>

              {/* Metadata row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-text-muted">
                  {selectedCase.citation}
                </span>
                <span className="text-text-muted/40">·</span>
                <span className="text-[10px] font-mono text-text-muted">
                  {selectedCase.court}
                </span>
                <span className="text-text-muted/40">·</span>
                <span className="text-[10px] font-mono text-text-muted">
                  {selectedCase.date.slice(0, 4)}
                </span>
              </div>

              {/* Outcome badge + similarity */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-widest"
                  style={{
                    color: OUTCOME_COLOR[selectedCase.outcome] ?? "#4f8ef7",
                    background: `${OUTCOME_COLOR[selectedCase.outcome] ?? "#4f8ef7"}18`,
                    border: `1px solid ${OUTCOME_COLOR[selectedCase.outcome] ?? "#4f8ef7"}30`,
                  }}
                >
                  {selectedCase.outcome}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  {Math.round(selectedCase.similarity * 100)}% match
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-5">
              {/* Summary with highlights */}
              <div>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Summary
                </p>
                <HighlightedText
                  text={selectedCase.summary}
                  spans={selectedCase.highlightedSpans ?? []}
                />
              </div>

              {/* Tags */}
              {selectedCase.tags.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCase.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-medium border border-border text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats grid */}
              <div>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Details
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Judge",           value: selectedCase.judge },
                    { label: "Practice Area",   value: selectedCase.practiceArea },
                    { label: "Citations",        value: String(selectedCase.citationCount) },
                    { label: "Confidence",       value: `${selectedCase.confidenceScore}/100` },
                    { label: "Precedent Str.",   value: `${selectedCase.precedentStrength}/100` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">{label}</span>
                      <span className="font-mono text-text-secondary">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center p-6 text-text-muted text-sm text-center"
          >
            Select a result to read the case
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
