import type { QueryResponse, RealAnalyticsData, EmbeddingPoint } from "@/lib/types";
import {
  MOCK_CASES,
  OUTCOME_TRENDS,
  PRACTICE_AREAS,
  JUDGE_STATS,
  SUMMARY_STATS,
} from "@/data/mock";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Mock data builders
// ---------------------------------------------------------------------------

function mockQueryResponse(query: string): QueryResponse {
  const results = MOCK_CASES.slice(0, 5).map((c, i) => ({
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

  return {
    prediction: {
      outcome: "affirmed",
      confidence: 82,
      casesRetrieved: results.length,
      avgSimilarity: 0.87,
    },
    shapValues: [
      { feature: "Prior circuit precedent", value: 0.31, direction: "positive" },
      { feature: "Statute of limitations", value: 0.22, direction: "positive" },
      { feature: "Judge affirmation rate",  value: 0.18, direction: "positive" },
      { feature: "Procedural posture",       value: -0.14, direction: "negative" },
      { feature: "Circuit split present",    value: -0.19, direction: "negative" },
      { feature: "Novel legal theory",       value: -0.24, direction: "negative" },
    ],
    results,
  };
}

function mockRealAnalytics(): RealAnalyticsData {
  const byCourt: Record<string, { affirmed: number; reversed: number; remanded: number; total: number }> = {};
  const byYear: Record<number, { affirmed: number; reversed: number; remanded: number }> = {};

  for (const c of MOCK_CASES) {
    const court = c.court;
    const year = parseInt(c.date.slice(0, 4));
    if (!byCourt[court]) byCourt[court] = { affirmed: 0, reversed: 0, remanded: 0, total: 0 };
    byCourt[court].total++;
    if (c.outcome === "affirmed") byCourt[court].affirmed++;
    if (c.outcome === "reversed") byCourt[court].reversed++;
    if (c.outcome === "remanded") byCourt[court].remanded++;
    if (!byYear[year]) byYear[year] = { affirmed: 0, reversed: 0, remanded: 0 };
    if (c.outcome === "affirmed") byYear[year].affirmed++;
    if (c.outcome === "reversed") byYear[year].reversed++;
    if (c.outcome === "remanded") byYear[year].remanded++;
  }

  const affirmedCount = MOCK_CASES.filter((c) => c.outcome === "affirmed").length;
  const total = MOCK_CASES.length;

  return {
    total_cases: total,
    affirmed: affirmedCount,
    reversed: MOCK_CASES.filter((c) => c.outcome === "reversed").length,
    remanded: MOCK_CASES.filter((c) => c.outcome === "remanded").length,
    affirm_rate: total > 0 ? affirmedCount / total : 0,
    by_court: Object.entries(byCourt)
      .map(([court, d]) => ({
        court,
        count: d.total,
        affirmed: d.affirmed,
        reversed: d.reversed,
        affirm_rate: d.total > 0 ? d.affirmed / d.total : 0,
      }))
      .sort((a, b) => b.count - a.count),
    by_year: Object.entries(byYear)
      .map(([year, d]) => ({ year: parseInt(year), ...d }))
      .sort((a, b) => a.year - b.year),
  };
}

function mockNeighbors(caseId: string): EmbeddingPoint[] {
  return MOCK_CASES.map((c, i) => ({
    id: c.id,
    x: Math.cos((i / MOCK_CASES.length) * 2 * Math.PI) * (50 + Math.random() * 30),
    y: Math.sin((i / MOCK_CASES.length) * 2 * Math.PI) * (50 + Math.random() * 30),
    outcome: c.outcome,
    title: c.title,
    practiceArea: c.practiceArea,
    similarity: c.id === caseId ? 1 : parseFloat((0.5 + Math.random() * 0.45).toFixed(2)),
  }));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function submitQuery(query: string): Promise<QueryResponse> {
  if (DEV_MODE) {
    await delay(1800);
    return mockQueryResponse(query);
  }
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`submitQuery failed: ${res.status}`);
  return res.json();
}

export async function getAnalytics(): Promise<RealAnalyticsData> {
  if (DEV_MODE) {
    await delay(1800);
    return mockRealAnalytics();
  }
  const res = await fetch(`${API_BASE}/api/analytics/outcomes`);
  if (!res.ok) throw new Error(`getAnalytics failed: ${res.status}`);
  return res.json();
}

export async function getCaseNeighbors(caseId: string): Promise<EmbeddingPoint[]> {
  if (DEV_MODE) {
    await delay(1800);
    return mockNeighbors(caseId);
  }
  const res = await fetch(`${API_BASE}/embeddings/${caseId}/neighbors`);
  if (!res.ok) throw new Error(`getCaseNeighbors failed: ${res.status}`);
  return res.json();
}
