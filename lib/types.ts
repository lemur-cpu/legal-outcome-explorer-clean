import type { OutcomeType } from "@/data/mock";

// A single case returned as part of a query result (extends mock Case shape)
export interface CaseResult {
  id: string;
  citation: string;
  title: string;
  court: string;
  judge: string;
  date: string;
  practiceArea: string;
  outcome: OutcomeType;
  confidenceScore: number;
  precedentStrength: number;
  citationCount: number;
  tags: string[];
  summary: string;
  // Added by the retrieval layer
  similarity: number; // 0–1
  highlightedSpans?: HighlightSpan[];
}

// A span of text inside a case document that is highlighted as relevant
export interface HighlightSpan {
  start: number;
  end: number;
  text: string;
  reason: string;
}

// One SHAP feature importance entry
export interface ShapValue {
  feature: string;
  value: number;  // positive = pushes toward affirmed, negative = reversed
  direction: "positive" | "negative";
}

// Outcome prediction for the query
export interface PredictionResult {
  outcome: OutcomeType;
  confidence: number;       // 0–1
  casesRetrieved: number;
  avgSimilarity: number;    // 0–1
}

// Full response from submitQuery
export interface QueryResponse {
  prediction: PredictionResult;
  shapValues: ShapValue[];
  results: CaseResult[];
}

// Analytics data bundle (mirrors mock data shapes)
export interface AnalyticsData {
  cases: import("@/data/mock").Case[];
  outcomeTrends: import("@/data/mock").OutcomeTrend[];
  practiceAreas: import("@/data/mock").PracticeAreaBreakdown[];
  judgeStats: import("@/data/mock").JudgeStats[];
  summaryStats: typeof import("@/data/mock").SUMMARY_STATS;
}

// Real analytics response from /api/analytics/outcomes
export interface CourtData {
  court: string;
  count: number;
  affirmed: number;
  reversed: number;
  affirm_rate: number;
}

export interface YearData {
  year: number;
  affirmed: number;
  reversed: number;
  remanded: number;
}

export interface RealAnalyticsData {
  total_cases: number;
  affirmed: number;
  reversed: number;
  remanded: number;
  affirm_rate: number;
  by_court: CourtData[];
  by_year: YearData[];
}

// A point in the 2-D embedding space (for the Clusters tab)
export interface EmbeddingPoint {
  id: string;
  x: number;
  y: number;
  outcome: OutcomeType;
  title: string;
  practiceArea: string;
  court?: string;
  year?: string;
  similarity?: number;
}
