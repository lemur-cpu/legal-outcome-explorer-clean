export type OutcomeType = "affirmed" | "reversed" | "remanded" | "settled";

export interface Case {
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
}

export interface JudgeStats {
  name: string;
  court: string;
  totalCases: number;
  affirmRate: number;
  reversalRate: number;
  avgDecisionDays: number;
  practiceAreas: string[];
}

export interface OutcomeTrend {
  month: string;
  affirmed: number;
  reversed: number;
  remanded: number;
  settled: number;
}

export interface PracticeAreaBreakdown {
  area: string;
  count: number;
  affirmRate: number;
  avgScore: number;
  color: string;
}

export const MOCK_CASES: Case[] = [
  {
    id: "1",
    citation: "487 U.S. 815 (2023)",
    title: "Meridian Corp. v. State Securities Bd.",
    court: "9th Circuit",
    judge: "Hon. Patricia Weston",
    date: "2023-11-14",
    practiceArea: "Securities",
    outcome: "affirmed",
    confidenceScore: 87,
    precedentStrength: 92,
    citationCount: 143,
    tags: ["securities fraud", "class action", "materiality"],
    summary:
      "Circuit affirmed district court's ruling on materiality threshold for securities fraud claims under Rule 10b-5.",
  },
  {
    id: "2",
    citation: "119 F.4th 202 (2024)",
    title: "Thornton Labs v. USPTO",
    court: "Fed. Circuit",
    judge: "Hon. David Chen",
    date: "2024-01-08",
    practiceArea: "Patent",
    outcome: "reversed",
    confidenceScore: 73,
    precedentStrength: 78,
    citationCount: 89,
    tags: ["patent eligibility", "§101", "software patents"],
    summary:
      "Federal Circuit reversed on §101 eligibility, finding claimed method not directed to abstract idea under Alice step one.",
  },
  {
    id: "3",
    citation: "82 F.4th 1101 (2023)",
    title: "United States v. Hargrove",
    court: "5th Circuit",
    judge: "Hon. Maria Santos",
    date: "2023-09-22",
    practiceArea: "Criminal",
    outcome: "affirmed",
    confidenceScore: 91,
    precedentStrength: 85,
    citationCount: 214,
    tags: ["Fourth Amendment", "warrant", "digital evidence"],
    summary:
      "Court affirmed conviction, holding warrant requirement applies to real-time CSLI tracking data.",
  },
  {
    id: "4",
    citation: "56 F.4th 788 (2024)",
    title: "Cascade Health Sys. v. HHS",
    court: "D.C. Circuit",
    judge: "Hon. Robert Ellison",
    date: "2024-02-29",
    practiceArea: "Administrative",
    outcome: "remanded",
    confidenceScore: 62,
    precedentStrength: 71,
    citationCount: 44,
    tags: ["APA", "Chevron", "health policy"],
    summary:
      "Circuit vacated agency rule and remanded for reasoned explanation under post-Chevron major questions doctrine.",
  },
  {
    id: "5",
    citation: "2024 WL 887234",
    title: "Apex Fintech v. CardNet Inc.",
    court: "S.D.N.Y.",
    judge: "Hon. Lisa Kaminsky",
    date: "2024-03-11",
    practiceArea: "Antitrust",
    outcome: "settled",
    confidenceScore: 55,
    precedentStrength: 41,
    citationCount: 12,
    tags: ["payment processing", "market power", "tying"],
    summary:
      "Parties reached confidential settlement before summary judgment ruling on market definition for payment networks.",
  },
  {
    id: "6",
    citation: "78 F.4th 445 (2023)",
    title: "NovaBio Inc. v. Zenith Pharma",
    court: "Fed. Circuit",
    judge: "Hon. David Chen",
    date: "2023-07-17",
    practiceArea: "Patent",
    outcome: "affirmed",
    confidenceScore: 84,
    precedentStrength: 88,
    citationCount: 167,
    tags: ["obviousness", "PHOSITA", "biotech"],
    summary:
      "Court affirmed obviousness finding; combination of prior art references rendered claimed compound obvious to skilled artisan.",
  },
  {
    id: "7",
    citation: "104 F.4th 332 (2024)",
    title: "Rivera v. Metropolitan Transit Auth.",
    court: "2nd Circuit",
    judge: "Hon. Sandra Okafor",
    date: "2024-01-23",
    practiceArea: "Employment",
    outcome: "reversed",
    confidenceScore: 79,
    precedentStrength: 74,
    citationCount: 58,
    tags: ["Title VII", "disparate impact", "burden shifting"],
    summary:
      "Second Circuit reversed summary judgment, finding plaintiff established prima facie case under McDonnell Douglas framework.",
  },
  {
    id: "8",
    citation: "2023 WL 4521988",
    title: "Blackwood Capital v. First National",
    court: "Del. Ch.",
    judge: "VC Priya Mehta",
    date: "2023-12-05",
    practiceArea: "Corporate",
    outcome: "affirmed",
    confidenceScore: 93,
    precedentStrength: 96,
    citationCount: 312,
    tags: ["fiduciary duty", "business judgment", "M&A"],
    summary:
      "Court upheld board's decision to adopt poison pill, applying deferential business judgment review under Revlon framework.",
  },
];

export const OUTCOME_TRENDS: OutcomeTrend[] = [
  { month: "Jan", affirmed: 42, reversed: 18, remanded: 11, settled: 8 },
  { month: "Feb", affirmed: 38, reversed: 22, remanded: 9, settled: 12 },
  { month: "Mar", affirmed: 45, reversed: 15, remanded: 14, settled: 7 },
  { month: "Apr", affirmed: 51, reversed: 19, remanded: 8, settled: 10 },
  { month: "May", affirmed: 47, reversed: 24, remanded: 12, settled: 9 },
  { month: "Jun", affirmed: 43, reversed: 21, remanded: 10, settled: 14 },
  { month: "Jul", affirmed: 49, reversed: 17, remanded: 13, settled: 6 },
  { month: "Aug", affirmed: 55, reversed: 20, remanded: 9, settled: 11 },
  { month: "Sep", affirmed: 48, reversed: 23, remanded: 11, settled: 8 },
  { month: "Oct", affirmed: 52, reversed: 16, remanded: 15, settled: 13 },
  { month: "Nov", affirmed: 44, reversed: 25, remanded: 8, settled: 9 },
  { month: "Dec", affirmed: 50, reversed: 19, remanded: 12, settled: 7 },
];

export const PRACTICE_AREAS: PracticeAreaBreakdown[] = [
  { area: "Securities", count: 284, affirmRate: 68, avgScore: 81, color: "#4f8ef7" },
  { area: "Patent", count: 421, affirmRate: 54, avgScore: 74, color: "#a78bfa" },
  { area: "Criminal", count: 612, affirmRate: 76, avgScore: 87, color: "#34d399" },
  { area: "Administrative", count: 198, affirmRate: 49, avgScore: 68, color: "#fbbf24" },
  { area: "Antitrust", count: 87, affirmRate: 61, avgScore: 72, color: "#f87171" },
  { area: "Employment", count: 334, affirmRate: 58, avgScore: 76, color: "#fb923c" },
  { area: "Corporate", count: 156, affirmRate: 71, avgScore: 83, color: "#22d3ee" },
];

export const JUDGE_STATS: JudgeStats[] = [
  {
    name: "Hon. Patricia Weston",
    court: "9th Circuit",
    totalCases: 847,
    affirmRate: 71,
    reversalRate: 18,
    avgDecisionDays: 142,
    practiceAreas: ["Securities", "Administrative", "Civil Rights"],
  },
  {
    name: "Hon. David Chen",
    court: "Fed. Circuit",
    totalCases: 1204,
    affirmRate: 58,
    reversalRate: 29,
    avgDecisionDays: 98,
    practiceAreas: ["Patent", "Trade", "Government Contracts"],
  },
  {
    name: "Hon. Maria Santos",
    court: "5th Circuit",
    totalCases: 932,
    affirmRate: 74,
    reversalRate: 16,
    avgDecisionDays: 167,
    practiceAreas: ["Criminal", "Immigration", "Energy"],
  },
  {
    name: "VC Priya Mehta",
    court: "Del. Ch.",
    totalCases: 463,
    affirmRate: 66,
    reversalRate: 22,
    avgDecisionDays: 84,
    practiceAreas: ["Corporate", "M&A", "Fiduciary"],
  },
];

export const SUMMARY_STATS = {
  totalCases: 2892,
  avgAffirmRate: 64,
  avgConfidenceScore: 78,
  casesThisMonth: 127,
  casesThisMonthDelta: 12,
  avgDecisionDays: 134,
  topCourt: "9th Circuit",
  topPracticeArea: "Criminal",
};

// Mock query-response data for DEV_MODE
export const MOCK_PREDICTION = {
  outcome: "affirmed" as OutcomeType,
  confidence: 0.74,       // 0–1
  casesRetrieved: 5,
  avgSimilarity: 0.847,   // 0–1
};

export const MOCK_EMBEDDING_POINTS = [
  // Affirmed cluster — upper right
  { id: "e1",  x:  2.3, y:  1.8, outcome: "affirmed" as OutcomeType, title: "Meridian Corp. v. State Securities Bd.", court: "9th Cir.",  year: "2023", practiceArea: "Securities"   },
  { id: "e2",  x:  1.9, y:  2.6, outcome: "affirmed" as OutcomeType, title: "NovaBio Inc. v. Zenith Pharma",           court: "Fed. Cir.", year: "2023", practiceArea: "Patent"        },
  { id: "e3",  x:  2.9, y:  1.1, outcome: "affirmed" as OutcomeType, title: "United States v. Hargrove",               court: "5th Cir.",  year: "2023", practiceArea: "Criminal"      },
  { id: "e4",  x:  3.3, y:  2.2, outcome: "affirmed" as OutcomeType, title: "Blackwood Capital v. First National",     court: "Del. Ch.",  year: "2023", practiceArea: "Corporate"     },
  { id: "e5",  x:  1.4, y:  3.3, outcome: "affirmed" as OutcomeType, title: "Coastal Energy v. EPA",                   court: "D.C. Cir.", year: "2022", practiceArea: "Administrative"},
  { id: "e6",  x:  3.5, y:  0.6, outcome: "affirmed" as OutcomeType, title: "Halstead v. First Bank Corp.",            court: "2nd Cir.",  year: "2024", practiceArea: "Banking"       },
  { id: "e7",  x:  2.0, y: -0.3, outcome: "affirmed" as OutcomeType, title: "Greystone LLC v. Parsons",                court: "9th Cir.",  year: "2023", practiceArea: "Securities"    },
  // Reversed cluster — lower left
  { id: "e8",  x: -2.2, y: -1.8, outcome: "reversed" as OutcomeType, title: "Thornton Labs v. USPTO",                  court: "Fed. Cir.", year: "2024", practiceArea: "Patent"        },
  { id: "e9",  x: -1.7, y: -2.6, outcome: "reversed" as OutcomeType, title: "Rivera v. Metropolitan Transit Auth.",    court: "2nd Cir.",  year: "2024", practiceArea: "Employment"    },
  { id: "e10", x: -2.7, y: -1.2, outcome: "reversed" as OutcomeType, title: "Hartford Ins. v. Okonkwo",                court: "7th Cir.",  year: "2023", practiceArea: "Insurance"     },
  { id: "e11", x: -3.3, y: -2.1, outcome: "reversed" as OutcomeType, title: "Global Pharma v. FDA",                    court: "D.C. Cir.", year: "2022", practiceArea: "Administrative"},
  { id: "e12", x: -1.5, y: -3.2, outcome: "reversed" as OutcomeType, title: "Apex Fintech v. CardNet Inc.",            court: "S.D.N.Y.", year: "2024", practiceArea: "Antitrust"     },
  // Remanded cluster — upper left / scattered
  { id: "e13", x: -2.0, y:  2.1, outcome: "remanded" as OutcomeType, title: "Cascade Health Sys. v. HHS",             court: "D.C. Cir.", year: "2024", practiceArea: "Administrative"},
  { id: "e14", x: -2.9, y:  1.4, outcome: "remanded" as OutcomeType, title: "Sterling Wireless v. FCC",               court: "D.C. Cir.", year: "2023", practiceArea: "Telecom"       },
  { id: "e15", x: -1.0, y:  2.9, outcome: "remanded" as OutcomeType, title: "Navarro v. Dept. of Labor",              court: "9th Cir.",  year: "2023", practiceArea: "Employment"    },
  { id: "e16", x: -3.6, y:  0.4, outcome: "remanded" as OutcomeType, title: "BioCore Inc. v. NIH",                    court: "Fed. Cir.", year: "2022", practiceArea: "Patent"        },
  // Scattered mid-field
  { id: "e17", x:  0.4, y: -2.8, outcome: "affirmed" as OutcomeType, title: "Paragon Steel v. NLRB",                  court: "6th Cir.",  year: "2023", practiceArea: "Labor"         },
  { id: "e18", x:  1.2, y: -2.0, outcome: "reversed" as OutcomeType, title: "DataSync v. Privacy Comm.",              court: "9th Cir.",  year: "2024", practiceArea: "Privacy"       },
  { id: "e19", x: -0.5, y: -0.9, outcome: "affirmed" as OutcomeType, title: "Thornbury v. Collins",                   court: "11th Cir.", year: "2023", practiceArea: "Civil Rights"  },
  { id: "e20", x:  0.9, y:  0.7, outcome: "remanded" as OutcomeType, title: "Verizon Media v. State AG",              court: "2nd Cir.",  year: "2024", practiceArea: "Antitrust"     },
];

export const MOCK_SHAP_VALUES = [
  { feature: "Circuit (9th)",       value: 0.28,  direction: "positive" as const },
  { feature: "Prior outcome rate",  value: 0.22,  direction: "positive" as const },
  { feature: "Legal domain match",  value: 0.19,  direction: "positive" as const },
  { feature: "Case age (years)",    value: -0.12, direction: "negative" as const },
  { feature: "Judge reversal rate", value: -0.17, direction: "negative" as const },
  { feature: "Similarity score",    value: -0.08, direction: "negative" as const },
];
