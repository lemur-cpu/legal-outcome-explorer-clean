"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { PRACTICE_AREAS } from "@/data/mock";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TooltipPayloadItem { payload: { count: number; affirmRate: number; avgScore: number } }
interface TooltipProps { active?: boolean; payload?: TooltipPayloadItem[]; label?: string; }
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-card text-xs">
      <p className="text-text-primary font-semibold mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">Cases</span>
          <span className="font-mono text-text-primary">{data.count}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">Affirm Rate</span>
          <span className="font-mono text-affirmed">{data.affirmRate}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">Avg Score</span>
          <span className="font-mono text-accent">{data.avgScore}</span>
        </div>
      </div>
    </div>
  );
}

export function PracticeAreaChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Cases by Practice Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={PRACTICE_AREAS}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#8b90a8", fontSize: 11 }}
                axisLine={{ stroke: "#2a2d3e" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="area"
                width={90}
                tick={{ fill: "#8b90a8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {PRACTICE_AREAS.map((entry) => (
                  <Cell key={entry.area} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
