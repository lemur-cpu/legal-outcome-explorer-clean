"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  type ScatterShapeProps,
} from "recharts";
import type { EmbeddingPoint } from "@/lib/types";

// ─── Colours ──────────────────────────────────────────────────────────────────
const OUTCOME_FILL: Record<string, string> = {
  affirmed: "#34d399",
  reversed: "#f87171",
  remanded: "#fbbf24",
  settled:  "#4f8ef7",
};

const MONO = "IBM Plex Mono, monospace";

// ─── Query point shape with pulsing ring ──────────────────────────────────────
// Ring starts at r=14 (outside center dot r=8) so it is visible.
// Inline style used for animation so transform-box/transform-origin work in SVG.
const QueryPointShape = (props: ScatterShapeProps) => {
  const { cx = 0, cy = 0 } = props;
  return (
    <g>
      <circle
        cx={cx} cy={cy} r={14}
        fill="none"
        stroke="#4f8ef7"
        strokeWidth={1.5}
        style={{
          animation:       "pulse-ring 1.5s ease-out infinite",
          transformBox:    "fill-box",
          transformOrigin: "center",
          opacity:         0.4,
        }}
      />
      <circle cx={cx} cy={cy} r={8} fill="#4f8ef7" opacity={1} />
    </g>
  );
};

// ─── Custom tooltip ───────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  payload: EmbeddingPoint & { court?: string; year?: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const p     = payload[0].payload;
  const color = OUTCOME_FILL[p.outcome] ?? "#565a72";

  return (
    <div
      style={{
        background:    "#1a1d27",
        border:        "1px solid #2a2d3a",
        borderRadius:  6,
        padding:       "8px 10px",
        fontFamily:    MONO,
        fontSize:      12,
        maxWidth:      240,
        pointerEvents: "none",
      }}
    >
      <p style={{ color: "#f0f2f8", fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>
        {p.title}
      </p>
      {p.court && <p style={{ color: "#8b90a8", marginBottom: 2 }}>{p.court}</p>}
      {p.year  && <p style={{ color: "#8b90a8", marginBottom: 4 }}>{p.year}</p>}
      <p style={{ color, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.08em" }}>
        {p.outcome}
      </p>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
const LEGEND_ITEMS = [
  { label: "Affirmed",   color: "#34d399" },
  { label: "Reversed",   color: "#f87171" },
  { label: "Remanded",   color: "#fbbf24" },
  { label: "Your Query", color: "#4f8ef7" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface QueryPoint {
  x: number;
  y: number;
  title: string;
}

interface EmbeddingScatterProps {
  points:        EmbeddingPoint[];
  queryPoint?:   QueryPoint;
  selectedId?:   string;
  retrievedIds?: string[];   // IDs of cases returned by the last query
}

// ─── EmbeddingScatter ─────────────────────────────────────────────────────────
export function EmbeddingScatter({
  points,
  queryPoint,
  selectedId,
  retrievedIds,
}: EmbeddingScatterProps) {
  const hasQuery      = (retrievedIds?.length ?? 0) > 0;
  const corpusPoints  = points.filter((p) => p.id !== selectedId);
  const selectedPoint = selectedId ? points.find((p) => p.id === selectedId) : undefined;

  const queryData: EmbeddingPoint[] = queryPoint
    ? [{
        id:          "query",
        x:           queryPoint.x,
        y:           queryPoint.y,
        title:       queryPoint.title,
        outcome:     "affirmed",   // overridden by shape
        practiceArea: "",
      }]
    : [];

  return (
    <div className="relative w-full" style={{ height: 420 }}>
      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
          <XAxis dataKey="x" type="number" hide domain={[-5.5, 5.5]} />
          <YAxis dataKey="y" type="number" hide domain={[-5.5, 5.5]} />

          <Tooltip
            content={(props) => (
              <CustomTooltip
                active={props.active}
                payload={props.payload as unknown as TooltipPayloadItem[] | undefined}
              />
            )}
            cursor={false}
          />

          {/* Corpus points — size/opacity depends on query state */}
          <Scatter
            data={corpusPoints}
            shape={(props: ScatterShapeProps) => {
              const p           = props.payload as EmbeddingPoint;
              const isRetrieved = retrievedIds?.includes(p.id) ?? false;
              const fill        = OUTCOME_FILL[p.outcome] ?? "#565a72";

              // After a query: emphasise retrieved, dim the rest
              const r       = hasQuery ? (isRetrieved ? 7 : 3)   : 4;
              const opacity = hasQuery ? (isRetrieved ? 1.0 : 0.3) : 0.6;
              const stroke  = isRetrieved ? "white" : undefined;
              const sw      = isRetrieved ? 1       : undefined;

              return (
                <circle
                  cx={props.cx as number}
                  cy={props.cy as number}
                  r={r}
                  fill={fill}
                  fillOpacity={opacity}
                  stroke={stroke}
                  strokeWidth={sw}
                />
              );
            }}
            isAnimationActive={false}
          />

          {/* Selected point */}
          {selectedPoint && (
            <Scatter
              data={[selectedPoint]}
              shape={(props: ScatterShapeProps) => (
                <circle
                  cx={props.cx as number}
                  cy={props.cy as number}
                  r={6}
                  fill="white"
                  stroke="#4f8ef7"
                  strokeWidth={2}
                />
              )}
              isAnimationActive={false}
            />
          )}

          {/* Query point — always blue with pulsing ring */}
          {queryData.length > 0 && (
            <Scatter
              data={queryData}
              shape={QueryPointShape}
              isAnimationActive={false}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div
        className="absolute bottom-6 left-6 flex items-center gap-4"
        style={{ pointerEvents: "none" }}
      >
        {LEGEND_ITEMS.map(({ label, color }) => (
          <span
            key={label}
            className="flex items-center gap-1.5"
            style={{ fontFamily: MONO, fontSize: 10, color: "#8b90a8" }}
          >
            <span style={{ color, fontSize: 12, lineHeight: 1 }}>●</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
