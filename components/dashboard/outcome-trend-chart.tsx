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

const COLORS = {
  affirmed: "#34d399",
  reversed: "#f87171",
  remanded: "#fbbf24",
  settled: "#4f8ef7",
};

interface TooltipProps { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string; }
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-card text-xs">
      <p className="text-text-secondary font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-text-secondary capitalize">{entry.dataKey}:</span>
          <span className="font-mono font-medium" style={{ color: entry.color }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function OutcomeTrendChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Outcome Trends — 12 Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={OUTCOME_TRENDS} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                {Object.entries(COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#8b90a8", fontSize: 11 }}
                axisLine={{ stroke: "#2a2d3e" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8b90a8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#8b90a8", fontSize: 11, textTransform: "capitalize" }}>
                    {value}
                  </span>
                )}
              />
              {Object.entries(COLORS).map(([key, color]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
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
