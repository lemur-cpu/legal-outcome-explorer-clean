import type { QueryResponse, RealAnalyticsData, EmbeddingPoint, CasesResponse } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function submitQuery(query: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`submitQuery failed: ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = (raw.results ?? []).map((c: any) => ({
    id: c.case_id,
    citation: c.case_id,
    title: c.title || c.case_id,
    court: c.court,
    judge: "Not available",
    date: `${c.year}-01-01`,
    practiceArea: "Federal Appeals",
    outcome: c.outcome,
    confidenceScore: 0,
    precedentStrength: 0,
    citationCount: 0,
    tags: [],
    summary: c.highlighted_snippets?.[0] ?? "",
    similarity: c.similarity_score,
    highlightedSpans: [],
  }));

  const avgSimilarity =
    results.length > 0
      ? results.reduce((s: number, r: { similarity: number }) => s + r.similarity, 0) /
        results.length
      : 0;

  return {
    prediction: {
      outcome: raw.prediction.outcome,
      confidence: raw.prediction.confidence,
      casesRetrieved: results.length,
      avgSimilarity: parseFloat(avgSimilarity.toFixed(3)),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shapValues: (raw.shap_values ?? []).map((s: any) => ({
      feature: s.feature,
      value: s.value,
      direction: s.direction === "+" ? "positive" : "negative",
    })),
    results,
  };
}

export async function getAnalytics(): Promise<RealAnalyticsData> {
  const res = await fetch(`${API_BASE}/api/analytics/outcomes`);
  if (!res.ok) throw new Error(`getAnalytics failed: ${res.status}`);
  return res.json();
}

export async function getCases(filters?: {
  outcome?: string;
  court?: string;
  limit?: number;
  offset?: number;
}): Promise<CasesResponse> {
  const params = new URLSearchParams();
  if (filters?.outcome && filters.outcome !== "all") params.set("outcome", filters.outcome);
  if (filters?.court && filters.court !== "all") params.set("court", filters.court);
  if (filters?.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters?.offset !== undefined) params.set("offset", String(filters.offset));
  const res = await fetch(`${API_BASE}/api/cases?${params}`);
  if (!res.ok) throw new Error(`getCases failed: ${res.status}`);
  return res.json();
}

export async function getCaseNeighbors(caseId: string): Promise<EmbeddingPoint[]> {
  const res = await fetch(`${API_BASE}/embeddings/${caseId}/neighbors`);
  if (!res.ok) throw new Error(`getCaseNeighbors failed: ${res.status}`);
  return res.json();
}
