"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/dashboard/nav";
import { OutcomeTrendChart } from "@/components/dashboard/outcome-trend-chart";
import { PracticeAreaChart } from "@/components/dashboard/practice-area-chart";
import { AffirmRateChart } from "@/components/dashboard/affirm-rate-chart";
import { CaseTable } from "@/components/dashboard/case-table";
import { JudgePanel } from "@/components/dashboard/judge-panel";
import { StatCard } from "@/components/ui/stat-card";
import { EmbeddingScatter } from "@/components/visualization/EmbeddingScatter";
import { Scale, TrendingDown, FileText, GitBranch, TrendingUp } from "lucide-react";
import type { CaseResult, PredictionResult, ShapValue, RealAnalyticsData } from "@/lib/types";
import { QueryBar } from "@/components/search/QueryBar";
import { PredictionCard } from "@/components/prediction/PredictionCard";
import { FeatureImportanceChart } from "@/components/explainability/FeatureImportanceChart";
import { ResultsList } from "@/components/results/ResultsList";
import { CaseViewer } from "@/components/viewer/CaseViewer";
import { getAnalytics, submitQuery } from "@/lib/api";

type Tab = "results" | "clusters" | "analytics";

const COURT_COLORS = ["#1a4b8c", "#166534", "#92400e", "#991b1b", "#ca8a04", "#4a7c59", "#6b3fa0"];

// ---------------------------------------------------------------------------
// Skeleton primitives
// ---------------------------------------------------------------------------

function SkeletonBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded shimmer ${className ?? ""}`} style={style} />;
}

function ResultsSkeleton() {
  return (
    <div>
      <div className="px-4 py-3 border-b" style={{ borderColor: "#e2ddd6" }}>
        <SkeletonBlock className="h-3 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-3.5 border-b space-y-2" style={{ borderColor: "#e2ddd6" }}>
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
  const [activeTab, setActiveTab]           = useState<Tab>("results");
  const [isLoading, setIsLoading]           = useState(false);
  const [queryError, setQueryError]         = useState<string | null>(null);
  const [prediction, setPrediction]         = useState<PredictionResult | null>(null);
  const [shapValues, setShapValues]         = useState<ShapValue[]>([]);
  const [results, setResults]               = useState<CaseResult[]>([]);
  const [selectedCase, setSelectedCase]     = useState<CaseResult | null>(null);
  const [analyticsData, setAnalyticsData]   = useState<RealAnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(false);
  // Track whether user navigated via Precedents nav
  const [precedentsMode, setPrecedentsMode] = useState(false);

  // Fetch analytics once when tab opens
  useEffect(() => {
    if (activeTab === "analytics" && analyticsData === null && !analyticsLoading) {
      setAnalyticsLoading(true);
      setAnalyticsError(false);
      getAnalytics()
        .then((data) => { setAnalyticsData(data); setAnalyticsLoading(false); })
        .catch(() => { setAnalyticsLoading(false); setAnalyticsError(true); });
    }
  }, [activeTab]);

  async function handleQuery(query: string) {
    setIsLoading(true);
    setQueryError(null);
    setPrecedentsMode(false);
    setActiveTab("results");

    try {
      const response = await submitQuery(query);
      setPrediction(response.prediction);
      setShapValues(response.shapValues);
      setResults(response.results);
      setSelectedCase(response.results[0] ?? null);
    } catch (e) {
      setQueryError("Query failed. Check that the backend is running.");
      setPrediction(null);
      setShapValues([]);
      setResults([]);
      setSelectedCase(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNavClick(nav: string) {
    switch (nav) {
      case "Analytics":
        setActiveTab("analytics");
        setPrecedentsMode(false);
        break;
      case "Precedents":
        setActiveTab("results");
        setPrecedentsMode(true);
        break;
      default:
        setActiveTab("results");
        setPrecedentsMode(false);
        break;
    }
  }

  function getActiveNav(tab: Tab): string {
    if (tab === "analytics") return "Analytics";
    return "Explorer";
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "results",   label: "Results"   },
    { id: "clusters",  label: "Clusters"  },
    { id: "analytics", label: "Analytics" },
  ];

  const resultsKey = isLoading
    ? "loading"
    : queryError
    ? "error"
    : results.length > 0
    ? "data"
    : "empty";

  // Hide left panel on analytics tab
  const showLeftPanel = activeTab !== "analytics";
  const gridCols     = showLeftPanel ? "300px 1fr 380px" : "1fr 380px";

  // ── Map real analytics to chart shapes ──
  const trendData = analyticsData
    ? analyticsData.by_year
        .filter((d) => d.year >= 1990 && d.year <= 2024)
        .map((d) => ({
          month:    String(d.year),
          affirmed: d.affirmed,
          reversed: d.reversed,
          remanded: d.remanded,
          settled:  0,
        }))
    : undefined;

  const courtChartData = analyticsData
    ? analyticsData.by_court.map((d, i) => ({
        area:       d.court.toUpperCase(),
        count:      d.count,
        affirmRate: Math.round(d.affirm_rate * 100),
        avgScore:   Math.round(d.affirm_rate * 100),
        color:      COURT_COLORS[i % COURT_COLORS.length],
      }))
    : undefined;

  const radarData = analyticsData
    ? analyticsData.by_court.map((d) => ({
        area:       d.court.toUpperCase(),
        affirmRate: Math.round(d.affirm_rate * 100),
      }))
    : undefined;

  const totalCases    = analyticsData?.total_cases;
  const avgAffirmRate = analyticsData
    ? Math.round(analyticsData.affirm_rate * 100)
    : null;
  const reversalRate = analyticsData
    ? Math.round((analyticsData.reversed / analyticsData.total_cases) * 100)
    : null;
  const circuitCount = analyticsData?.by_court.length ?? null;

  const outcomeDist = analyticsData
    ? [
        {
          label: "Affirmed",
          value: Math.round((analyticsData.affirmed / analyticsData.total_cases) * 100),
          count: analyticsData.affirmed.toLocaleString(),
          color: "#166534",
        },
        {
          label: "Reversed",
          value: Math.round((analyticsData.reversed / analyticsData.total_cases) * 100),
          count: analyticsData.reversed.toLocaleString(),
          color: "#991b1b",
        },
        {
          label: "Remanded",
          value: Math.round((analyticsData.remanded / analyticsData.total_cases) * 100),
          count: analyticsData.remanded.toLocaleString(),
          color: "#92400e",
        },
      ]
    : [];

  const emptyMsg = precedentsMode
    ? "Browse precedents or submit a query to find relevant cases"
    : "Submit a query to see results";

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#f8f6f1" }}>
      <Nav activeNav={getActiveNav(activeTab)} onNavClick={handleNavClick} />

      <div className="flex-1 grid min-h-0" style={{ gridTemplateColumns: gridCols }}>

        {/* ── LEFT: Prediction + SHAP ──────────────────────────────────── */}
        {showLeftPanel && (
          <aside
            className="flex flex-col gap-4 p-4 overflow-y-auto border-r"
            style={{ background: "#f8f6f1", borderColor: "#e2ddd6" }}
          >
            <PredictionCard prediction={prediction} isLoading={isLoading} />
            <FeatureImportanceChart shapValues={shapValues} isLoading={isLoading} />
          </aside>
        )}

        {/* ── CENTER: QueryBar + Tabs ───────────────────────────────────── */}
        <main className="flex flex-col min-h-0">
          <div
            className="shrink-0 px-6 py-4 border-b backdrop-blur-md"
            style={{ background: "rgba(248,246,241,0.9)", borderColor: "#e2ddd6" }}
          >
            <QueryBar onSubmit={handleQuery} isLoading={isLoading} />
          </div>

          {/* Tab bar */}
          <div
            className="shrink-0 flex gap-1 px-6 pt-3 pb-0 border-b"
            style={{ background: "#ffffff", borderColor: "#e2ddd6" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPrecedentsMode(false); }}
                className="px-4 py-2 text-sm font-medium transition-colors relative"
                style={{ color: activeTab === tab.id ? "#1a4b8c" : "#a8a29e" }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t"
                    style={{ background: "#1a4b8c" }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto" style={{ background: "#f8f6f1" }}>

            {/* ── Results ── */}
            {activeTab === "results" && (
              <AnimatePresence mode="wait">
                {resultsKey === "empty" && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center h-full text-sm"
                    style={{ color: "#a8a29e" }}
                  >
                    {emptyMsg}
                  </motion.div>
                )}
                {resultsKey === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center h-full text-sm"
                    style={{ color: "#991b1b" }}
                  >
                    {queryError}
                  </motion.div>
                )}
                {resultsKey === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    style={{ background: "#ffffff" }}
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
                    style={{ background: "#ffffff" }}
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

            {/* ── Clusters ── */}
            {activeTab === "clusters" && (
              <div className="p-4">
                {results.length === 0 ? (
                  <div
                    className="flex items-center justify-center h-64 text-sm"
                    style={{ color: "#a8a29e" }}
                  >
                    Submit a query to visualise the embedding space
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <p
                        className="uppercase"
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          color: "#a8a29e",
                        }}
                      >
                        Embedding Space · {results.length} cases
                      </p>
                      <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#a8a29e" }}>
                        Hover a point to inspect
                      </p>
                    </div>
                    <EmbeddingScatter
                      points={[]}
                      queryPoint={{ x: 0.3, y: -0.8, title: "Your Query" }}
                      selectedId={selectedCase?.id}
                      retrievedIds={results.map((r) => r.id)}
                    />
                  </>
                )}
              </div>
            )}

            {/* ── Analytics ── */}
            {activeTab === "analytics" && (
              <div className="p-6 space-y-6">
                {analyticsLoading ? (
                  <div
                    className="flex items-center justify-center h-48 text-sm"
                    style={{ color: "#a8a29e" }}
                  >
                    Loading analytics…
                  </div>
                ) : analyticsError ? (
                  <div
                    className="flex items-center justify-center h-48 text-sm"
                    style={{ color: "#991b1b" }}
                  >
                    Failed to load analytics. Check that the backend is running.
                  </div>
                ) : (
                  <>
                    {/* Stat cards — 4 real metrics */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                      <StatCard
                        label="Total Cases"
                        value={totalCases != null ? totalCases.toLocaleString() : "—"}
                        icon={FileText}
                        accent="blue"
                        delay={0}
                      />
                      <StatCard
                        label="Avg Affirm Rate"
                        value={avgAffirmRate != null ? `${avgAffirmRate}%` : "—"}
                        icon={TrendingUp}
                        accent="green"
                        delay={0.05}
                      />
                      <StatCard
                        label="Reversal Rate"
                        value={reversalRate != null ? `${reversalRate}%` : "—"}
                        icon={TrendingDown}
                        accent="red"
                        delay={0.1}
                      />
                      <StatCard
                        label="Circuits Covered"
                        value={circuitCount != null ? String(circuitCount) : "—"}
                        icon={GitBranch}
                        accent="blue"
                        delay={0.15}
                      />
                    </div>

                    {/* Trend + Affirm Rate */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <OutcomeTrendChart
                          data={trendData}
                          title="Outcome Trends by Year"
                          subtitle="Federal Circuit Courts of Appeals"
                        />
                      </div>
                      <AffirmRateChart data={radarData} />
                    </div>

                    {/* Courts + Outcome Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <PracticeAreaChart
                        data={courtChartData}
                        title="Cases by Court"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-2 rounded-lg border p-5"
                        style={{ background: "#ffffff", borderColor: "#e2ddd6" }}
                      >
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-4"
                          style={{ color: "#57534e" }}
                        >
                          Outcome Distribution
                        </p>
                        {outcomeDist.length === 0 ? (
                          <div className="h-32 flex items-center justify-center text-sm" style={{ color: "#a8a29e" }}>
                            No data
                          </div>
                        ) : (
                          <>
                            <div className="space-y-3">
                              {outcomeDist.map((item, i) => (
                                <motion.div
                                  key={item.label}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                                >
                                  <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span style={{ color: "#57534e" }}>{item.label}</span>
                                    <span className="font-mono font-medium" style={{ color: item.color }}>
                                      {item.value}%
                                    </span>
                                  </div>
                                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#e2ddd6" }}>
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
                            <div
                              className="mt-5 pt-4 border-t grid gap-2"
                              style={{
                                borderColor: "#e2ddd6",
                                gridTemplateColumns: `repeat(${outcomeDist.length}, 1fr)`,
                              }}
                            >
                              {outcomeDist.map((item) => (
                                <div key={item.label} className="text-center">
                                  <p className="font-mono text-lg font-semibold" style={{ color: item.color }}>
                                    {item.count}
                                  </p>
                                  <p className="text-[10px] mt-0.5" style={{ color: "#a8a29e" }}>
                                    {item.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </motion.div>
                    </div>

                    {/* Case Table + Corpus Coverage */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                      <div className="xl:col-span-2">
                        <CaseTable />
                      </div>
                      <JudgePanel data={analyticsData ?? undefined} />
                    </div>

                    <motion.footer
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-center justify-between py-4 border-t text-xs"
                      style={{ borderColor: "#e2ddd6", color: "#a8a29e" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Scale size={12} />
                        <span>PrecedentIQ — Legal Analytics Platform</span>
                      </div>
                      <span className="font-mono">v0.1.0-beta</span>
                    </motion.footer>
                  </>
                )}
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT: Case Viewer ──────────────────────────────────────────── */}
        <aside className="flex flex-col overflow-hidden border-l" style={{ borderColor: "#e2ddd6" }}>
          <CaseViewer
            selectedCase={selectedCase}
            isLoading={isLoading}
            predictionConfidence={prediction ? Math.round(prediction.confidence * 100) : undefined}
          />
        </aside>
      </div>
    </div>
  );
}
