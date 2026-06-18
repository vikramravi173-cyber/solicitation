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
import { synthesizeBullets } from "@/lib/reporting/synthesize-text";
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
  const profile = await buildSolicitationProfile(solicitation, research);
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

  report.executiveSummary = synthesizeBullets([
    `Best catalog match for "${trimmed}": ${displayTitle} (${solicitation.department}, due ${formatDueDate(solicitation.dueDate)}) — ${match.matchScore}% relevance.`,
    `${opportunity.acceptance.likelihoodScore}% estimated fit (${opportunity.acceptance.likelihoodLabel}) — ${opportunity.summary.tailored.pursuitRecommendation}.`,
    "See eligibility, funding, and application guidance below.",
  ]);
  report.overallStrategy = synthesizeBullets([
    `Download and review the official solicitation for ${displayTitle}.`,
    "Build a compliance matrix and validate your TRL against expected maturity.",
    "For ranked matches across the full catalog, run the company match flow.",
  ]);

  return {
    id: newId(),
    company,
    catalogProfileCount: solicitations.length,
    analyzedOpportunities: [opportunity],
    report,
  };
}
