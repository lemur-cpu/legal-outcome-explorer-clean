import type { QueryResponse, AnalyticsData, EmbeddingPoint } from "@/lib/types";
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

function mockAnalytics(): AnalyticsData {
  return {
    cases: MOCK_CASES,
    outcomeTrends: OUTCOME_TRENDS,
    practiceAreas: PRACTICE_AREAS,
    judgeStats: JUDGE_STATS,
    summaryStats: SUMMARY_STATS,
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

export async function getAnalytics(): Promise<AnalyticsData> {
  if (DEV_MODE) {
    await delay(1800);
    return mockAnalytics();
  }
  const res = await fetch(`${API_BASE}/analytics`);
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
