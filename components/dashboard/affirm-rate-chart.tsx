"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const GRID = "#e2ddd6";
const TICK = "#a8a29e";

interface RadarEntry { area: string; affirmRate: number; avgScore?: number }

interface TooltipPayloadItem { value: number; payload: { area: string } }
interface TooltipProps { active?: boolean; payload?: TooltipPayloadItem[] }
function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg p-3 text-xs border"
      style={{ background: "#ffffff", borderColor: "#e2ddd6", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>{payload[0]?.payload?.area}</p>
      <div className="flex justify-between gap-3">
        <span style={{ color: "#57534e" }}>Affirm Rate</span>
        <span className="font-mono" style={{ color: "#166534" }}>{payload[0]?.value}%</span>
      </div>
    </div>
  );
}

interface AffirmRateChartProps {
  data?: RadarEntry[];
}

export function AffirmRateChart({ data }: AffirmRateChartProps) {
  const radarData = data ?? [];

  // Fewer than 5 points → radar looks broken; use horizontal bar instead
  const useBar = radarData.length < 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Affirm Rate by {data ? "Court" : "Area"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            {useBar ? (
              <BarChart
                data={radarData}
                layout="vertical"
                margin={{ top: 0, right: 32, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: TICK, fontSize: 11 }}
                  axisLine={{ stroke: GRID }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="area"
                  width={60}
                  tick={{ fill: TICK, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(26,75,140,0.04)" }} />
                <Bar dataKey="affirmRate" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {radarData.map((entry, i) => (
                    <Cell
                      key={entry.area}
                      fill={entry.affirmRate >= 70 ? "#166534" : entry.affirmRate >= 50 ? "#1a4b8c" : "#991b1b"}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <RadarChart data={radarData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
                <PolarGrid stroke={GRID} />
                <PolarAngleAxis dataKey="area" tick={{ fill: TICK, fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: TICK, fontSize: 9 }} tickCount={4} />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Affirm Rate"
                  dataKey="affirmRate"
                  stroke="#166534"
                  fill="#166534"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
