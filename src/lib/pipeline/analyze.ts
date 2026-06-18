import type { CompanyProfile } from "@/lib/company/questionnaire";
import type {
  AnalysisResult,
  AnalyzedOpportunity,
  MatchedSolicitation,
  ScrapedContent,
} from "@/lib/domain/types";
import { getSolicitations } from "@/lib/data/solicitations-store";
import { fetchSolicitationResearch } from "@/lib/research/fetch-solicitation-research";
import { buildSolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import {
  matchSolicitations,
  solicitationSearchCorpus,
} from "@/lib/matching/match-solicitations";
import { textMatchScore } from "@/lib/matching/text-utils";
import { companyProfileFromKeywords } from "@/lib/company/keyword-profile";
import { resolveDisplayTitle } from "@/lib/solicitations/display-title";
import { buildFinalReport } from "@/lib/reporting/build-report";
import { formatDueDate } from "@/lib/reporting/format-display";
import { synthesizeSentences } from "@/lib/reporting/synthesize-text";
import { summarizeOpportunity } from "@/lib/research/summarize-opportunity";
import { scoreAcceptanceLikelihood } from "@/lib/scoring/acceptance-likelihood";
import type { SolicitationRow } from "@/lib/solicitations/types";

export interface AnalysisProgress {
  stage: "loading" | "matching" | "scoring" | "reporting" | "complete";
  message: string;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** @deprecated Catalog-only stub; use fetchSolicitationResearch instead. */
function emptyResearch(url: string): ScrapedContent {
  return {
    solicitationUrl: url,
    solicitationPageText: "",
    supplementalSources: [],
    scrapedAt: new Date().toISOString(),
  };
}

async function buildOpportunity(
  company: CompanyProfile,
  match: MatchedSolicitation,
): Promise<AnalyzedOpportunity> {
  const { solicitation } = match;
  const research = solicitation.link
    ? await fetchSolicitationResearch(solicitation)
    : emptyResearch("");
  const profile = buildSolicitationProfile(solicitation, research);
  const acceptance = await scoreAcceptanceLikelihood(company, solicitation, profile);
  const summary = await summarizeOpportunity(
    company,
    solicitation,
    research,
    match,
    acceptance,
    profile,
  );
  return { match, research, summary, acceptance };
}

export async function runAnalysis(
  company: CompanyProfile,
  onProgress?: (p: AnalysisProgress) => void,
): Promise<AnalysisResult> {
  onProgress?.({ stage: "loading", message: "Loading catalog…" });
  const solicitations = getSolicitations();

  onProgress?.({ stage: "matching", message: "Scoring fit across the catalog…" });
  const matches = await matchSolicitations(company, solicitations);

  const analyzedOpportunities: AnalyzedOpportunity[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    onProgress?.({
      stage: "scoring",
      message: `Researching ${i + 1} of ${matches.length}: ${resolveDisplayTitle(match.solicitation)}`,
    });
    analyzedOpportunities.push(await buildOpportunity(company, match));
  }

  onProgress?.({ stage: "reporting", message: "Assembling your dossier…" });
  const report = await buildFinalReport(
    company,
    analyzedOpportunities,
    solicitations.length,
  );

  onProgress?.({ stage: "complete", message: "Dossier ready." });

  return {
    id: newId(),
    company,
    catalogProfileCount: solicitations.length,
    analyzedOpportunities,
    report,
  };
}

function buildKeywordMatch(
  query: string,
  solicitation: SolicitationRow,
): MatchedSolicitation {
  const displayTitle = resolveDisplayTitle(solicitation);
  const score = Math.round(textMatchScore(query, solicitationSearchCorpus(solicitation)) * 100);
  return {
    solicitation,
    matchScore: Math.min(100, Math.max(0, score)),
    matchRationale: `Your search for "${query}" matched this opportunity's title, focus areas, and catalog metadata (${displayTitle}).`,
  };
}

export async function runKeywordOpportunityAnalysis(
  query: string,
  rowIndex: number,
): Promise<AnalysisResult> {
  const trimmed = query.trim();
  if (!trimmed) throw new Error("Search query is required");

  const solicitations = getSolicitations();
  const solicitation = solicitations.find((row) => row.rowIndex === rowIndex);
  if (!solicitation) throw new Error("Solicitation not found in catalog");

  const company = companyProfileFromKeywords(trimmed);
  const match = buildKeywordMatch(trimmed, solicitation);
  const displayTitle = resolveDisplayTitle(solicitation);

  const opportunity = await buildOpportunity(company, match);
  const report = await buildFinalReport(company, [opportunity], solicitations.length);

  report.executiveSummary = synthesizeSentences([
    `Closest catalog match for "${trimmed}" is ${displayTitle} (${solicitation.department}, due ${formatDueDate(solicitation.dueDate)}) at ${match.matchScore}% relevance.`,
    `Estimated fit for a generic applicant is ${opportunity.acceptance.likelihoodScore}% (${opportunity.acceptance.likelihoodLabel.toLowerCase()}). Recommendation: ${opportunity.summary.tailored.pursuitRecommendation.toLowerCase()}.`,
    "The brief below covers eligibility, funding, requirements, and tailored guidance for this opportunity.",
  ]);
  report.overallStrategy = synthesizeSentences([
    `Review the official solicitation and confirm ${displayTitle} fits your capabilities.`,
    "Build a compliance matrix against the stated requirements and validate your TRL against the expected maturity.",
    "For a ranked list across the full catalog, run the company match.",
  ]);

  return {
    id: newId(),
    company,
    catalogProfileCount: solicitations.length,
    analyzedOpportunities: [opportunity],
    report,
  };
}
