"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { PRACTICE_AREAS } from "@/data/mock";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const radarData = PRACTICE_AREAS.map((a) => ({
  area: a.area,
  affirmRate: a.affirmRate,
  avgScore: a.avgScore,
}));

interface TooltipPayloadItem { value: number; payload: { area: string } }
interface TooltipProps { active?: boolean; payload?: TooltipPayloadItem[] }
function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-card text-xs">
      <p className="font-semibold text-text-primary mb-1">{payload[0]?.payload?.area}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-3">
          <span className="text-text-secondary">Affirm Rate</span>
          <span className="font-mono text-affirmed">{payload[0]?.value}%</span>
        </div>
        {payload[1] && (
          <div className="flex justify-between gap-3">
            <span className="text-text-secondary">Avg Score</span>
            <span className="font-mono text-accent">{payload[1]?.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AffirmRateChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Affirm Rate by Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
              <PolarGrid stroke="#2a2d3e" />
              <PolarAngleAxis
                dataKey="area"
                tick={{ fill: "#8b90a8", fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#565a72", fontSize: 9 }}
                tickCount={4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Affirm Rate"
                dataKey="affirmRate"
                stroke="#34d399"
                fill="#34d399"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Radar
                name="Avg Score"
                dataKey="avgScore"
                stroke="#4f8ef7"
                fill="#4f8ef7"
                fillOpacity={0.1}
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
