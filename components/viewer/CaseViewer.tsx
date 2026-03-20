"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HighlightedText } from "./HighlightedText";
import type { CaseResult } from "@/lib/types";

const MONO  = "IBM Plex Mono, monospace";
const SERIF = "IBM Plex Serif, Georgia, serif";

const OUTCOME_COLOR: Record<string, string> = {
  affirmed: "#34d399",
  reversed: "#f87171",
  remanded: "#fbbf24",
  settled:  "#4f8ef7",
};

// ─── Shimmer skeleton ────────────────────────────────────────────────────────
function ViewerSkeleton() {
  const lineWidths = ["90%", "100%", "75%", "100%", "85%", "60%", "100%", "70%"];
  return (
    <div className="flex flex-col h-full">
      {/* Header shimmer */}
      <div
        className="shrink-0 px-4 py-3 border-b space-y-2.5"
        style={{ background: "#0f1117", borderColor: "#2a2d3a" }}
      >
        <div className="shimmer rounded" style={{ height: 16, width: "80%" }} />
        <div className="shimmer rounded" style={{ height: 11, width: "55%" }} />
        <div className="shimmer rounded" style={{ height: 20, width: 80 }} />
      </div>
      {/* Text line skeletons */}
      <div className="flex-1 px-4 py-5 space-y-3">
        {lineWidths.map((w, i) => (
          <div key={i} className="shimmer rounded" style={{ height: 12, width: w }} />
        ))}
      </div>
    </div>
  );
}

// ─── CaseViewer ──────────────────────────────────────────────────────────────
interface CaseViewerProps {
  selectedCase: CaseResult | null;
  isLoading?: boolean;
}

export function CaseViewer({ selectedCase, isLoading = false }: CaseViewerProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Loading */}
        {isLoading && (
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
        )}

        {/* Empty */}
        {!isLoading && !selectedCase && (
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

        {/* Case */}
        {!isLoading && selectedCase && (
          <motion.div
            key={selectedCase.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full"
          >
            {/* Sticky header */}
            <div
              className="shrink-0 sticky top-0 z-10 px-4 py-3 border-b"
              style={{ background: "#0f1117", borderColor: "#2a2d3a" }}
            >
              {/* Title — IBM Plex Serif 15px, 2-line clamp */}
              <p
                className="font-semibold text-text-primary line-clamp-2 mb-1.5"
                style={{ fontFamily: SERIF, fontSize: 15 }}
              >
                {selectedCase.title}
              </p>

              {/* Metadata row */}
              <p
                className="text-text-muted mb-2"
                style={{ fontFamily: MONO, fontSize: 11 }}
              >
                {selectedCase.court} · {selectedCase.date.slice(0, 4)} · {selectedCase.citation}
              </p>

              {/* Outcome badge + similarity */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded uppercase"
                  style={{
                    fontFamily:   MONO,
                    fontSize:     11,
                    fontWeight:   600,
                    letterSpacing: "0.06em",
                    color:        OUTCOME_COLOR[selectedCase.outcome] ?? "#4f8ef7",
                    background:   `${OUTCOME_COLOR[selectedCase.outcome] ?? "#4f8ef7"}1a`,
                    border:       `1px solid ${OUTCOME_COLOR[selectedCase.outcome] ?? "#4f8ef7"}40`,
                  }}
                >
                  {selectedCase.outcome}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#4f8ef7" }}>
                  {Math.round(selectedCase.similarity * 100)}% match
                </span>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Summary with highlights */}
              <div>
                <p
                  className="text-text-muted uppercase mb-2"
                  style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em" }}
                >
                  Summary
                </p>
                <HighlightedText
                  text={selectedCase.summary}
                  spans={selectedCase.highlightedSpans ?? []}
                />
              </div>

              {/* Opinion body — IBM Plex Serif 13px leading-relaxed */}
              <div>
                <p
                  className="text-text-muted uppercase mb-3"
                  style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em" }}
                >
                  Opinion
                </p>
                <div
                  className="text-text-secondary space-y-4"
                  style={{ fontFamily: SERIF, fontSize: 13, lineHeight: "1.8" }}
                >
                  <p>
                    The court, having reviewed the full record and considered all
                    submissions of counsel, issues the following opinion. The question
                    presented is one requiring careful analysis of the applicable
                    statutory framework and controlling precedent in this circuit.
                  </p>
                  <p>
                    {selectedCase.summary} Upon independent review, the panel finds
                    the reasoning below to be well-supported by the weight of authority
                    and consistent with the purposes of the relevant statutory scheme.
                  </p>
                  <p>
                    For the foregoing reasons, the judgment of the district court is{" "}
                    <span style={{ fontWeight: 600, color: "#f0f2f8", textTransform: "uppercase" }}>
                      {selectedCase.outcome}
                    </span>
                    . Costs to appellant. IT IS SO ORDERED.
                  </p>
                </div>
              </div>

              {/* Tags */}
              {selectedCase.tags.length > 0 && (
                <div>
                  <p
                    className="text-text-muted uppercase mb-2"
                    style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em" }}
                  >
                    Key Issues
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCase.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded border text-text-secondary"
                        style={{ fontFamily: MONO, fontSize: 10, borderColor: "#2a2d3a" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="border-t pt-4 space-y-2" style={{ borderColor: "#2a2d3a" }}>
                {[
                  { label: "Judge",          value: selectedCase.judge },
                  { label: "Practice Area",  value: selectedCase.practiceArea },
                  { label: "Citations",      value: String(selectedCase.citationCount) },
                  { label: "Confidence",     value: `${selectedCase.confidenceScore}/100` },
                  { label: "Precedent Str.", value: `${selectedCase.precedentStrength}/100` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span
                      className="text-text-muted uppercase"
                      style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em" }}
                    >
                      {label}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: "#f0f2f8" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
