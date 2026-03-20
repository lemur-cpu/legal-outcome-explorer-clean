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

// ─── Colours ─────────────────────────────────────────────────────────────────
const OUTCOME_FILL: Record<string, string> = {
  affirmed: "#34d399",
  reversed: "#f87171",
  remanded: "#fbbf24",
  settled:  "#4f8ef7",
};

const MONO = "IBM Plex Mono, monospace";

// ─── Custom dot shapes ────────────────────────────────────────────────────────

function CorpusDot(props: { cx?: number; cy?: number; payload?: EmbeddingPoint }) {
  const { cx = 0, cy = 0, payload } = props;
  const fill = OUTCOME_FILL[payload?.outcome ?? ""] ?? "#565a72";
  return (
    <circle cx={cx} cy={cy} r={4} fill={fill} fillOpacity={0.6} />
  );
}

function SelectedDot(props: { cx?: number; cy?: number }) {
  const { cx = 0, cy = 0 } = props;
  return (
    <circle
      cx={cx} cy={cy} r={6}
      fill="white"
      stroke="#4f8ef7"
      strokeWidth={2}
    />
  );
}

function QueryDot(props: { cx?: number; cy?: number }) {
  const { cx = 0, cy = 0 } = props;
  return (
    <g>
      {/* Pulsing ring */}
      <circle
        cx={cx} cy={cy} r={8}
        fill="none"
        stroke="#4f8ef7"
        strokeWidth={2}
        className="scatter-pulse"
      />
      {/* Solid centre */}
      <circle cx={cx} cy={cy} r={8} fill="#4f8ef7" fillOpacity={1} />
    </g>
  );
}

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
  const p = payload[0].payload;
  const color = OUTCOME_FILL[p.outcome] ?? "#565a72";

  return (
    <div
      style={{
        background:   "#1a1d27",
        border:       "1px solid #2a2d3a",
        borderRadius: 6,
        padding:      "8px 10px",
        fontFamily:   MONO,
        fontSize:     12,
        maxWidth:     240,
        pointerEvents: "none",
      }}
    >
      <p style={{ color: "#f0f2f8", fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>
        {p.title}
      </p>
      {p.court && (
        <p style={{ color: "#8b90a8", marginBottom: 2 }}>{p.court}</p>
      )}
      {p.year && (
        <p style={{ color: "#8b90a8", marginBottom: 4 }}>{p.year}</p>
      )}
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

// ─── EmbeddingScatter ─────────────────────────────────────────────────────────

interface QueryPoint {
  x: number;
  y: number;
  title: string;
}

interface EmbeddingScatterProps {
  points: EmbeddingPoint[];
  queryPoint?: QueryPoint;
  selectedId?: string;
}

export function EmbeddingScatter({
  points,
  queryPoint,
  selectedId,
}: EmbeddingScatterProps) {
  const corpusPoints  = points.filter((p) => p.id !== selectedId);
  const selectedPoint = selectedId ? points.find((p) => p.id === selectedId) : undefined;

  // Recharts needs the query point as EmbeddingPoint shape
  const queryData: EmbeddingPoint[] = queryPoint
    ? [{
        id: "query",
        x: queryPoint.x,
        y: queryPoint.y,
        title: queryPoint.title,
        outcome: "affirmed", // placeholder — shape is overridden
        practiceArea: "",
      }]
    : [];

  return (
    <div className="relative w-full" style={{ height: 420 }}>
      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
          {/* No axes, no grid — clean dark space */}
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

          {/* Corpus points — coloured by outcome */}
          <Scatter
            data={corpusPoints}
            shape={(props: ScatterShapeProps) => (
              <CorpusDot
                cx={props.cx as number}
                cy={props.cy as number}
                payload={props.payload as EmbeddingPoint}
              />
            )}
            isAnimationActive={false}
          />

          {/* Selected point */}
          {selectedPoint && (
            <Scatter
              data={[selectedPoint]}
              shape={(props: ScatterShapeProps) => (
                <SelectedDot
                  cx={props.cx as number}
                  cy={props.cy as number}
                />
              )}
              isAnimationActive={false}
            />
          )}

          {/* Query point with pulsing ring */}
          {queryData.length > 0 && (
            <Scatter
              data={queryData}
              shape={(props: ScatterShapeProps) => (
                <QueryDot
                  cx={props.cx as number}
                  cy={props.cy as number}
                />
              )}
              isAnimationActive={false}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend — absolute bottom-left over chart */}
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
