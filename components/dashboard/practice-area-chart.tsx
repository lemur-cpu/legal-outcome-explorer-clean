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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const GRID = "#e2ddd6";
const TICK = "#a8a29e";

interface TooltipPayloadItem { payload: { count: number; affirmRate: number; avgScore: number } }
interface TooltipProps { active?: boolean; payload?: TooltipPayloadItem[]; label?: string; }
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div
      className="rounded-lg p-3 text-xs border"
      style={{ background: "#ffffff", borderColor: "#e2ddd6", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      <p className="font-semibold mb-2" style={{ color: "#1c1917" }}>{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span style={{ color: "#57534e" }}>Cases</span>
          <span className="font-mono" style={{ color: "#1c1917" }}>{data.count}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: "#57534e" }}>Affirm Rate</span>
          <span className="font-mono" style={{ color: "#166534" }}>{data.affirmRate}%</span>
        </div>
      </div>
    </div>
  );
}

interface ChartEntry {
  area: string;
  count: number;
  affirmRate: number;
  avgScore?: number;
  color: string;
}

interface PracticeAreaChartProps {
  data?: ChartEntry[];
  title?: string;
}

export function PracticeAreaChart({ data, title }: PracticeAreaChartProps) {
  const chartData  = data ?? [];
  const chartTitle = title ?? "Cases by Court";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{chartTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} tickLine={false} />
              <YAxis type="category" dataKey="area" width={90} tick={{ fill: TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(26,75,140,0.04)" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {chartData.map((entry) => (
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
