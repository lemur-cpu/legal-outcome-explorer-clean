"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HighlightedText } from "./HighlightedText";
import type { CaseResult } from "@/lib/types";

const MONO  = "IBM Plex Mono, monospace";
const SERIF = "IBM Plex Serif, Georgia, serif";

// Outcome badge config — muted academic palette
const OUTCOME_BADGE: Record<string, { text: string; bg: string; border: string }> = {
  affirmed: { text: "#166534", bg: "#dcfce7", border: "#86efac" },
  reversed: { text: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
  remanded: { text: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  settled:  { text: "#1a4b8c", bg: "#e8eef7", border: "#93c5fd" },
};

const VIEWER_HEADER = "#1a4b8c";  // deep navy — document anchor
const VIEWER_BODY   = "#ffffff";
const VIEWER_TEXT   = "#1c1917";
const VIEWER_MUTED  = "#57534e";
const VIEWER_BORDER = "#e2ddd6";

// ─── Shimmer skeleton ────────────────────────────────────────────────────────
function ViewerSkeleton() {
  const lineWidths = ["90%", "100%", "75%", "100%", "85%", "60%", "100%", "70%"];
  return (
    <div className="flex flex-col h-full">
      <div
        className="shrink-0 px-4 py-3 border-b space-y-2.5"
        style={{ background: VIEWER_HEADER, borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div className="shimmer rounded" style={{ height: 16, width: "80%", opacity: 0.4 }} />
        <div className="shimmer rounded" style={{ height: 11, width: "55%", opacity: 0.3 }} />
        <div className="shimmer rounded" style={{ height: 20, width: 80,    opacity: 0.3 }} />
      </div>
      <div className="flex-1 px-4 py-5 space-y-3" style={{ background: VIEWER_BODY }}>
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
  predictionConfidence?: number;
}

export function CaseViewer({ selectedCase, isLoading = false, predictionConfidence }: CaseViewerProps) {
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
            className="flex-1 flex items-center justify-center p-6 text-sm text-center"
            style={{ color: "#a8a29e", background: VIEWER_BODY }}
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
            {/* ── Sticky header — deep navy ─────────────────────────────── */}
            <div
              className="shrink-0 sticky top-0 z-10 px-4 py-3 border-b"
              style={{ background: VIEWER_HEADER, borderColor: "rgba(255,255,255,0.12)" }}
            >
              {/* Title — IBM Plex Serif 15px white */}
              <p
                className="font-semibold line-clamp-2 mb-1.5"
                style={{ fontFamily: SERIF, fontSize: 15, color: "#ffffff" }}
              >
                {selectedCase.title}
              </p>

              {/* Metadata row */}
              <p
                className="mb-2"
                style={{ fontFamily: MONO, fontSize: 11, color: "rgba(226,232,240,0.7)" }}
              >
                {selectedCase.court} · {selectedCase.date.slice(0, 4)}
                {selectedCase.citation ? ` · ${selectedCase.citation}` : ""}
              </p>

              {/* Outcome badge + similarity */}
              <div className="flex items-center justify-between">
                {(() => {
                  const b = OUTCOME_BADGE[selectedCase.outcome] ?? OUTCOME_BADGE.settled;
                  return (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded uppercase"
                      style={{
                        fontFamily:    MONO,
                        fontSize:      11,
                        fontWeight:    600,
                        letterSpacing: "0.06em",
                        color:         b.text,
                        background:    b.bg,
                        border:        `1px solid ${b.border}`,
                      }}
                    >
                      {selectedCase.outcome}
                    </span>
                  );
                })()}
                <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(226,232,240,0.6)" }}>
                  {Math.round(selectedCase.similarity * 100)}% match
                </span>
              </div>
            </div>

            {/* ── Scrollable body — white document ─────────────────────── */}
            <div
              className="flex-1 overflow-y-auto p-5 space-y-5"
              style={{ background: VIEWER_BODY, color: VIEWER_TEXT }}
            >
              {/* Summary with highlights */}
              <div>
                <p
                  className="uppercase mb-2"
                  style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: VIEWER_MUTED }}
                >
                  Summary
                </p>
                <HighlightedText
                  text={selectedCase.summary}
                  spans={selectedCase.highlightedSpans ?? []}
                />
              </div>

              {/* Opinion body — IBM Plex Serif 15px leading-loose */}
              <div>
                <p
                  className="uppercase mb-3"
                  style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: VIEWER_MUTED }}
                >
                  Opinion
                </p>
                <div
                  className="space-y-4"
                  style={{ fontFamily: SERIF, fontSize: 15, lineHeight: "2.0", color: VIEWER_TEXT }}
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
                    <span style={{ fontWeight: 600, textTransform: "uppercase" }}>
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
                    className="uppercase mb-2"
                    style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: VIEWER_MUTED }}
                  >
                    Key Issues
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCase.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded border"
                        style={{ fontFamily: MONO, fontSize: 10, borderColor: VIEWER_BORDER, color: VIEWER_MUTED }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="border-t pt-4 space-y-2" style={{ borderColor: VIEWER_BORDER }}>
                {[
                  { label: "Judge",         value: selectedCase.judge || "Not available" },
                  { label: "Practice Area", value: selectedCase.practiceArea || "Federal Appeals" },
                  { label: "Citations",     value: selectedCase.citationCount ? String(selectedCase.citationCount) : "—" },
                  ...(predictionConfidence !== undefined
                    ? [{ label: "Confidence", value: `${predictionConfidence}%` }]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span
                      className="uppercase"
                      style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: VIEWER_MUTED }}
                    >
                      {label}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: VIEWER_TEXT }}>
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
