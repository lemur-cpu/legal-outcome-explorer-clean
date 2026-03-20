"use client";

import { motion } from "framer-motion";
import {
  Scale,
  TrendingUp,
  BarChart2,
  Clock,
  FileText,
} from "lucide-react";
import { Nav } from "@/components/dashboard/nav";
import { StatCard } from "@/components/ui/stat-card";
import { OutcomeTrendChart } from "@/components/dashboard/outcome-trend-chart";
import { PracticeAreaChart } from "@/components/dashboard/practice-area-chart";
import { AffirmRateChart } from "@/components/dashboard/affirm-rate-chart";
import { CaseTable } from "@/components/dashboard/case-table";
import { JudgePanel } from "@/components/dashboard/judge-panel";
import { SUMMARY_STATS } from "@/data/mock";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Nav />

      {/* Glow backdrop */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />
      </div>

      <main className="relative max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Legal Outcome Explorer
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Analytics across{" "}
              <span className="font-mono text-accent">
                {SUMMARY_STATS.totalCases.toLocaleString()}
              </span>{" "}
              cases · Updated daily
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-surface border border-border text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-affirmed animate-pulse" />
            Live data
          </div>
        </motion.div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Cases"
            value={SUMMARY_STATS.totalCases.toLocaleString()}
            icon={FileText}
            accent="blue"
            delay={0}
          />
          <StatCard
            label="Avg Affirm Rate"
            value={`${SUMMARY_STATS.avgAffirmRate}%`}
            icon={TrendingUp}
            accent="green"
            delay={0.05}
          />
          <StatCard
            label="This Month"
            value={SUMMARY_STATS.casesThisMonth}
            delta={SUMMARY_STATS.casesThisMonthDelta}
            deltaLabel="vs last month"
            icon={BarChart2}
            accent="yellow"
            delay={0.1}
          />
          <StatCard
            label="Avg Decision Days"
            value={SUMMARY_STATS.avgDecisionDays}
            icon={Clock}
            accent="blue"
            delay={0.15}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <OutcomeTrendChart />
          </div>
          <AffirmRateChart />
        </div>

        {/* Practice area chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PracticeAreaChart />

          {/* Outcome distribution card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 rounded-lg bg-surface border border-border shadow-card p-5"
          >
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
              Outcome Distribution
            </p>
            <div className="space-y-3">
              {[
                { label: "Affirmed", value: 64, color: "#34d399" },
                { label: "Reversed", value: 21, color: "#f87171" },
                { label: "Remanded", value: 11, color: "#fbbf24" },
                { label: "Settled", value: 4, color: "#4f8ef7" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="font-mono font-medium" style={{ color: item.color }}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{
                        duration: 0.9,
                        ease: "easeOut",
                        delay: 0.5 + i * 0.08,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Outcome counts row */}
            <div className="mt-5 pt-4 border-t border-border grid grid-cols-4 gap-2">
              {[
                { label: "Affirmed", count: "1,851", color: "#34d399" },
                { label: "Reversed", count: "607", color: "#f87171" },
                { label: "Remanded", count: "318", color: "#fbbf24" },
                { label: "Settled", count: "116", color: "#4f8ef7" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="font-mono text-lg font-semibold" style={{ color: item.color }}>
                    {item.count}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Case table + Judge panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <CaseTable />
          </div>
          <JudgePanel />
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-between py-4 border-t border-border text-xs text-text-muted"
        >
          <div className="flex items-center gap-1.5">
            <Scale size={12} />
            <span>PrecedentIQ — Legal Analytics Platform</span>
          </div>
          <span className="font-mono">v0.1.0-beta</span>
        </motion.footer>
      </main>
    </div>
  );
}
