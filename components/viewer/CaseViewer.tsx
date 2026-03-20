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

function ViewerSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header shimmer */}
      <div className="shrink-0 px-4 py-3 border-b border-border space-y-2.5" style={{ background: "#0f1117" }}>
        <div className="shimmer rounded h-3.5 w-3/4" />
        <div className="shimmer rounded h-2.5 w-1/2" />
        <div className="shimmer rounded h-5 w-20" />
      </div>
      {/* Body shimmer — 8 text lines */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {[90, 100, 75, 100, 85, 60, 100, 70].map((w, i) => (
          <div key={i} className="shimmer rounded h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

export function CaseViewer({
  selectedCase,
  isLoading = false,
}: {
  selectedCase: CaseResult | null;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            <ViewerSkeleton />
          </motion.div>
        ) : selectedCase ? (
          <motion.div
            key={selectedCase.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full"
          >
            {/* Sticky header — bg #0f1117 */}
            <div
              className="shrink-0 sticky top-0 z-10 px-4 py-3 border-b border-border space-y-2"
              style={{ background: "#0f1117" }}
            >
              {/* Title */}
              <p className="text-[13px] font-semibold text-text-primary leading-snug">
                {selectedCase.title}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-text-muted">
                <span>{selectedCase.citation}</span>
                <span className="opacity-40">·</span>
                <span>{selectedCase.court}</span>
                <span className="opacity-40">·</span>
                <span>{selectedCase.date.slice(0, 4)}</span>
                <span className="opacity-40">·</span>
                <span>{selectedCase.judge}</span>
              </div>

              {/* Outcome + similarity */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-widest"
                  style={{
                    color: OUTCOME_COLOR[selectedCase.outcome] ?? "#4f8ef7",
                    background: `${OUTCOME_COLOR[selectedCase.outcome] ?? "#4f8ef7"}1f`,
                    border: `1px solid ${OUTCOME_COLOR[selectedCase.outcome] ?? "#4f8ef7"}4d`,
                  }}
                >
                  {selectedCase.outcome}
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  {Math.round(selectedCase.similarity * 100)}% match
                </span>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* Summary with highlighted spans */}
              <div>
                <p className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Summary
                </p>
                <HighlightedText
                  text={selectedCase.summary}
                  spans={selectedCase.highlightedSpans ?? []}
                />
              </div>

              {/* Full case text — IBM Plex Serif 13px, line-height 1.8 */}
              <div>
                <p className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Opinion
                </p>
                <div
                  className="font-legal text-[13px] text-text-secondary space-y-4"
                  style={{ lineHeight: 1.8 }}
                >
                  <p>
                    The court, having reviewed the record in its entirety and considered the
                    arguments of counsel for all parties, hereby issues the following opinion.
                    The central question presented in this matter is one of first impression in
                    this circuit, requiring careful analysis of the applicable statutory
                    framework and relevant precedent from sister circuits.
                  </p>
                  <p>
                    {selectedCase.summary} The panel is unanimous in its conclusion and
                    finds the reasoning of the district court to be well-reasoned and
                    supported by the weight of authority. We write separately only to address
                    the dissent&apos;s contention regarding the standard of review.
                  </p>
                  <p>
                    Accordingly, the judgment of the district court is{" "}
                    <span className="font-semibold text-text-primary uppercase">
                      {selectedCase.outcome}
                    </span>
                    . Costs are taxed to appellant. IT IS SO ORDERED.
                  </p>
                </div>
              </div>

              {/* Tags */}
              {selectedCase.tags.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Key Issues
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

              {/* Stats */}
              <div className="border-t border-border pt-4 space-y-2">
                {[
                  { label: "Practice Area",   value: selectedCase.practiceArea },
                  { label: "Citations",        value: String(selectedCase.citationCount) },
                  { label: "Confidence",       value: `${selectedCase.confidenceScore}/100` },
                  { label: "Precedent Str.",   value: `${selectedCase.precedentStrength}/100` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-text-muted uppercase tracking-wider">{label}</span>
                    <span className="font-mono text-text-secondary">{value}</span>
                  </div>
                ))}
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
