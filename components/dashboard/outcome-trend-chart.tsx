"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { OUTCOME_TRENDS } from "@/data/mock";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TrendEntry {
  month: string;
  affirmed: number;
  reversed: number;
  remanded: number;
  settled: number;
}

// Muted academic palette
const COLORS = {
  affirmed: "#166534",
  reversed: "#991b1b",
  remanded: "#92400e",
  settled:  "#1a4b8c",
};

const GRID  = "#e2ddd6";
const TICK  = "#a8a29e";

interface TooltipProps {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg p-3 text-xs border"
      style={{ background: "#ffffff", borderColor: "#e2ddd6", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      <p className="font-medium mb-2" style={{ color: "#57534e" }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize" style={{ color: "#57534e" }}>{entry.dataKey}:</span>
          <span className="font-mono font-medium" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface OutcomeTrendChartProps {
  data?: TrendEntry[];
  title?: string;
  subtitle?: string;
}

export function OutcomeTrendChart({ data, title, subtitle }: OutcomeTrendChartProps) {
  const chartData  = data ?? OUTCOME_TRENDS;
  const chartTitle = title ?? "Outcome Trends — 12 Month";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{chartTitle}</CardTitle>
          {subtitle && (
            <p className="text-[11px] mt-0.5" style={{ color: "#a8a29e" }}>{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                {Object.entries(COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="month" tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} tickLine={false} />
              <YAxis tick={{ fill: TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: TICK, fontSize: 11, textTransform: "capitalize" }}>{value}</span>
                )}
              />
              {Object.entries(COLORS).map(([key, color]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={1.5}
                  fill={`url(#grad-${key})`}
                  dot={false}
                  activeDot={{ r: 4, fill: color }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
