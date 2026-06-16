import type { CompanyProfile } from "@/lib/company/questionnaire";
import type { SolicitationRow } from "@/lib/solicitations/types";

export interface MatchedSolicitation {
  solicitation: SolicitationRow;
  matchScore: number;
  matchRationale: string;
}

export interface ScrapedContent {
  solicitationUrl: string;
  solicitationPageText: string;
  supplementalSources: Array<{
    url: string;
    title: string;
    excerpt: string;
  }>;
  scrapedAt: string;
}

export interface OpportunitySummary {
  solicitationNumber: string;
  title: string;
  onePageSummary: string;
  keyRequirements: string[];
  fitHighlights: string[];
  risksAndGaps: string[];
  sourcesUsed: string[];
}

export interface AcceptanceAssessment {
  likelihoodScore: number;
  likelihoodLabel: "Low" | "Moderate" | "High" | "Very High";
  rationale: string;
  strengths: string[];
  weaknesses: string[];
  recommendedActions: string[];
}

export interface AnalyzedOpportunity {
  match: MatchedSolicitation;
  research: ScrapedContent;
  summary: OpportunitySummary;
  acceptance: AcceptanceAssessment;
}

export interface FinalReport {
  executiveSummary: string;
  recommendedOpportunities: Array<{
    rank: number;
    title: string;
    solicitationNumber: string;
    department: string;
    dueDate: string;
    link: string;
    likelihoodScore: number;
    likelihoodLabel: AcceptanceAssessment["likelihoodLabel"];
    whyRecommended: string;
  }>;
  overallStrategy: string;
  generatedAt: string;
}

export interface AnalysisResult {
  id: string;
  company: CompanyProfile;
  analyzedOpportunities: AnalyzedOpportunity[];
  report: FinalReport;
}
