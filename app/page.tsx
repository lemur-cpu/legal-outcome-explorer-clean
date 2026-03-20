"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/dashboard/nav";
import { OutcomeTrendChart } from "@/components/dashboard/outcome-trend-chart";
import { PracticeAreaChart } from "@/components/dashboard/practice-area-chart";
import { AffirmRateChart } from "@/components/dashboard/affirm-rate-chart";
import { CaseTable } from "@/components/dashboard/case-table";
import { JudgePanel } from "@/components/dashboard/judge-panel";
import { StatCard } from "@/components/ui/stat-card";
import { MOCK_CASES, SUMMARY_STATS } from "@/data/mock";
import { Scale, TrendingUp, BarChart2, Clock, FileText } from "lucide-react";
import type { CaseResult, PredictionResult, ShapValue } from "@/lib/types";
import { QueryBar } from "@/components/search/QueryBar";
import { PredictionCard } from "@/components/prediction/PredictionCard";
import { FeatureImportanceChart } from "@/components/explainability/FeatureImportanceChart";
import { ResultsList } from "@/components/results/ResultsList";
import { CaseViewer } from "@/components/viewer/CaseViewer";

type Tab = "results" | "clusters" | "analytics";

// ---------------------------------------------------------------------------
// Skeleton primitives
// ---------------------------------------------------------------------------

function SkeletonBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded shimmer ${className ?? ""}`}
      style={style}
    />
  );
}

function PredictionSkeleton() {
  return (
    <div className="rounded-lg bg-surface border border-border p-4 space-y-4">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-8 w-28 mx-auto" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-8" />
        </div>
        <SkeletonBlock className="h-1.5 w-full" />
      </div>
      <div className="pt-1 border-t border-border space-y-2.5">
        <div className="flex justify-between">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-3 w-6" />
        </div>
        <div className="flex justify-between">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}

function ShapSkeleton() {
  return (
    <div className="rounded-lg bg-surface border border-border p-4 space-y-4">
      <SkeletonBlock className="h-3 w-36" />
      {[70, 58, 82, 46, 64, 50].map((w, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between items-center">
            <SkeletonBlock className="h-3" style={{ width: `${w}%` }} />
            <SkeletonBlock className="h-3 w-8" />
          </div>
          <SkeletonBlock className="h-1 w-full" />
        </div>
      ))}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div>
      <div className="px-4 py-3 border-b border-border">
        <SkeletonBlock className="h-3 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-3.5 border-b border-border/50 space-y-2">
          <div className="flex justify-between">
            <SkeletonBlock className="h-3.5 w-2/3" />
            <SkeletonBlock className="h-3.5 w-10" />
          </div>
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-3/4" />
          <div className="flex gap-1.5 pt-0.5">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-4 w-10" />
            <SkeletonBlock className="h-4 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  const [activeTab, setActiveTab]     = useState<Tab>("results");
  const [isLoading, setIsLoading]     = useState(false);
  const [prediction, setPrediction]   = useState<PredictionResult | null>(null);
  const [shapValues, setShapValues]   = useState<ShapValue[]>([]);
  const [results, setResults]         = useState<CaseResult[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);

  async function handleQuery(_query: string) {
    setIsLoading(true);
    setActiveTab("results");

    await new Promise<void>((resolve) => setTimeout(resolve, 1800));

    const mockResults: CaseResult[] = MOCK_CASES.slice(0, 5).map((c, i) => ({
      ...c,
      similarity: parseFloat((0.97 - i * 0.06).toFixed(2)),
      highlightedSpans: [
        {
          start: 0,
          end: Math.min(40, c.summary.length),
          text: c.summary.slice(0, 40),
          reason: "High semantic similarity to query",
        },
      ],
    }));

    setPrediction({
      outcome: "affirmed",
      confidence: 82,
      casesRetrieved: mockResults.length,
      avgSimilarity: 0.87,
    });
    setShapValues([
      { feature: "Prior circuit precedent", value: 0.31,  direction: "positive" },
      { feature: "Statute of limitations",  value: 0.22,  direction: "positive" },
      { feature: "Judge affirmation rate",  value: 0.18,  direction: "positive" },
      { feature: "Procedural posture",      value: -0.14, direction: "negative" },
      { feature: "Circuit split present",   value: -0.19, direction: "negative" },
      { feature: "Novel legal theory",      value: -0.24, direction: "negative" },
    ]);
    setResults(mockResults);
    setSelectedCase(mockResults[0] ?? null);
    setIsLoading(false);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "results",   label: "Results"   },
    { id: "clusters",  label: "Clusters"  },
    { id: "analytics", label: "Analytics" },
  ];

  const hasData    = prediction !== null;
  const leftKey    = isLoading ? "loading" : hasData       ? "data" : "empty";
  const resultsKey = isLoading ? "loading" : results.length > 0 ? "data" : "empty";

  return (
    <div className="h-screen flex flex-col bg-background text-text-primary overflow-hidden">
      <Nav />

      {/* 3-column grid */}
      <div
        className="flex-1 grid min-h-0"
        style={{ gridTemplateColumns: "300px 1fr 380px" }}
      >
        {/* ── LEFT: Prediction + SHAP ─────────────────────────────────────── */}
        <aside className="flex flex-col gap-4 p-4 border-r border-border overflow-y-auto">
          <AnimatePresence mode="wait">
            {leftKey === "empty" && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="rounded-lg bg-surface border border-border p-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Prediction</p>
                  <div className="h-32 flex items-center justify-center text-text-muted text-sm border border-dashed border-border rounded">
                    Submit a query to see prediction
                  </div>
                </div>
                <div className="rounded-lg bg-surface border border-border p-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Feature Importance</p>
                  <div className="h-48 flex items-center justify-center text-text-muted text-sm border border-dashed border-border rounded">
                    SHAP values will appear here
                  </div>
                </div>
              </motion.div>
            )}

            {leftKey === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <PredictionSkeleton />
                <ShapSkeleton />
              </motion.div>
            )}

            {leftKey === "data" && prediction && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <PredictionCard prediction={prediction} />
                <FeatureImportanceChart shapValues={shapValues} />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* ── CENTER: QueryBar + Tabs ──────────────────────────────────────── */}
        <main className="flex flex-col min-h-0">
          <div className="shrink-0 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
            <QueryBar onSubmit={handleQuery} isLoading={isLoading} />
          </div>

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

          <div className="flex-1 overflow-y-auto border-t border-border bg-surface rounded-tr-lg">
            {activeTab === "results" && (
              <AnimatePresence mode="wait">
                {resultsKey === "empty" && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center h-full text-text-muted text-sm"
                  >
                    Submit a query to see results
                  </motion.div>
                )}

                {resultsKey === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ResultsSkeleton />
                  </motion.div>
                )}

                {resultsKey === "data" && (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-full"
                  >
                    <ResultsList
                      results={results}
                      selectedId={selectedCase?.id ?? null}
                      onSelect={setSelectedCase}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {activeTab === "clusters" && (
              <div className="p-6 flex items-center justify-center h-full text-text-muted text-sm">
                Cluster view coming soon…
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  <StatCard label="Total Cases"       value={SUMMARY_STATS.totalCases.toLocaleString()} icon={FileText}  accent="blue"   delay={0}    />
                  <StatCard label="Avg Affirm Rate"   value={`${SUMMARY_STATS.avgAffirmRate}%`}          icon={TrendingUp} accent="green"  delay={0.05} />
                  <StatCard label="This Month"        value={SUMMARY_STATS.casesThisMonth}               icon={BarChart2}  accent="yellow" delay={0.1}  delta={SUMMARY_STATS.casesThisMonthDelta} deltaLabel="vs last month" />
                  <StatCard label="Avg Decision Days" value={SUMMARY_STATS.avgDecisionDays}              icon={Clock}      accent="blue"   delay={0.15} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2"><OutcomeTrendChart /></div>
                  <AffirmRateChart />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <PracticeAreaChart />
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-2 rounded-lg bg-surface border border-border shadow-card p-5"
                  >
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Outcome Distribution</p>
                    <div className="space-y-3">
                      {[
                        { label: "Affirmed", value: 64, color: "#34d399" },
                        { label: "Reversed", value: 21, color: "#f87171" },
                        { label: "Remanded", value: 11, color: "#fbbf24" },
                        { label: "Settled",  value: 4,  color: "#4f8ef7" },
                      ].map((item, i) => (
                        <motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="text-text-secondary">{item.label}</span>
                            <span className="font-mono font-medium" style={{ color: item.color }}>{item.value}%</span>
                          </div>
                          <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full" style={{ backgroundColor: item.color }} initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 + i * 0.08 }} />
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
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="xl:col-span-2"><CaseTable /></div>
                  <JudgePanel />
                </div>
                <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center justify-between py-4 border-t border-border text-xs text-text-muted">
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
        <aside className="flex flex-col border-l border-border overflow-hidden">
          <CaseViewer selectedCase={selectedCase} isLoading={isLoading} />
        </aside>
      </div>
    </div>
  );
}
