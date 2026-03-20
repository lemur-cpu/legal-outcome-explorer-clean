"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Nav } from "@/components/dashboard/nav";
import { OutcomeTrendChart } from "@/components/dashboard/outcome-trend-chart";
import { PracticeAreaChart } from "@/components/dashboard/practice-area-chart";
import { AffirmRateChart } from "@/components/dashboard/affirm-rate-chart";
import { CaseTable } from "@/components/dashboard/case-table";
import { JudgePanel } from "@/components/dashboard/judge-panel";
import { StatCard } from "@/components/ui/stat-card";
import { SUMMARY_STATS } from "@/data/mock";
import { Scale, TrendingUp, BarChart2, Clock, FileText } from "lucide-react";
import type { QueryResponse, CaseResult } from "@/lib/types";

type Tab = "results" | "clusters" | "analytics";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("results");
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const TABS: { id: Tab; label: string }[] = [
    { id: "results",   label: "Results"   },
    { id: "clusters",  label: "Clusters"  },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background text-text-primary overflow-hidden">
      <Nav />

      {/* 3-column grid — fills remaining viewport height */}
      <div
        className="flex-1 grid min-h-0"
        style={{ gridTemplateColumns: "300px 1fr 380px" }}
      >
        {/* ── LEFT: Prediction + SHAP ─────────────────────────────────────── */}
        <aside className="flex flex-col gap-4 p-4 border-r border-border overflow-y-auto">
          {/* Prediction placeholder */}
          <div className="rounded-lg bg-surface border border-border p-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Prediction
            </p>
            <div className="h-32 flex items-center justify-center text-text-muted text-sm border border-dashed border-border rounded">
              Submit a query to see prediction
            </div>
          </div>

          {/* SHAP placeholder */}
          <div className="rounded-lg bg-surface border border-border p-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Feature Importance
            </p>
            <div className="h-48 flex items-center justify-center text-text-muted text-sm border border-dashed border-border rounded">
              SHAP values will appear here
            </div>
          </div>
        </aside>

        {/* ── CENTER: QueryBar + Tabs ──────────────────────────────────────── */}
        <main className="flex flex-col min-h-0">
          {/* QueryBar placeholder */}
          <div className="shrink-0 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="max-w-[520px] mx-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-border text-text-muted text-sm">
                <span className="flex-1">Query bar coming in Step 4…</span>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="shrink-0 flex gap-1 px-6 pt-4 pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-1.5 text-sm font-medium rounded-t transition-colors
                  ${activeTab === tab.id
                    ? "bg-surface border border-b-0 border-border text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto border-t border-border bg-surface rounded-tr-lg">
            {activeTab === "results" && (
              <div className="p-6 flex items-center justify-center h-full text-text-muted text-sm">
                Results list coming in Step 7…
              </div>
            )}

            {activeTab === "clusters" && (
              <div className="p-6 flex items-center justify-center h-full text-text-muted text-sm">
                Cluster view coming soon…
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="p-6 space-y-6">
                {/* Summary stats */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  <StatCard label="Total Cases"      value={SUMMARY_STATS.totalCases.toLocaleString()} icon={FileText}  accent="blue"   delay={0}    />
                  <StatCard label="Avg Affirm Rate"  value={`${SUMMARY_STATS.avgAffirmRate}%`}          icon={TrendingUp} accent="green"  delay={0.05} />
                  <StatCard label="This Month"       value={SUMMARY_STATS.casesThisMonth}               icon={BarChart2}  accent="yellow" delay={0.1}  delta={SUMMARY_STATS.casesThisMonthDelta} deltaLabel="vs last month" />
                  <StatCard label="Avg Decision Days" value={SUMMARY_STATS.avgDecisionDays}             icon={Clock}      accent="blue"   delay={0.15} />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2"><OutcomeTrendChart /></div>
                  <AffirmRateChart />
                </div>

                {/* Practice area + outcome distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <PracticeAreaChart />

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
                        { label: "Settled",  value: 4,  color: "#4f8ef7" },
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
                              transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 + i * 0.08 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-border grid grid-cols-4 gap-2">
                      {[
                        { label: "Affirmed", count: "1,851", color: "#34d399" },
                        { label: "Reversed", count: "607",   color: "#f87171" },
                        { label: "Remanded", count: "318",   color: "#fbbf24" },
                        { label: "Settled",  count: "116",   color: "#4f8ef7" },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <p className="font-mono text-lg font-semibold" style={{ color: item.color }}>{item.count}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Case table + Judge panel */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="xl:col-span-2"><CaseTable /></div>
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
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT: Case Viewer ───────────────────────────────────────────── */}
        <aside className="flex flex-col border-l border-border overflow-y-auto">
          <div className="p-4 border-b border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Case Viewer
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center p-6 text-text-muted text-sm text-center">
            Select a result to read the case
          </div>
        </aside>
      </div>
    </div>
  );
}
