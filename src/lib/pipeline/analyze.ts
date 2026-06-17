import type { CompanyProfile } from "@/lib/company/questionnaire";
import type { AnalysisResult, AnalyzedOpportunity, MatchedSolicitation } from "@/lib/domain/types";
import { fetchSolicitations } from "@/lib/data/solicitations-store";
import { enrichProfile, loadSolicitationProfilePool } from "@/lib/data/solicitation-profiles-store";
import { matchSolicitations, solicitationSearchCorpus } from "@/lib/matching/match-solicitations";
import { overlapScore } from "@/lib/matching/text-utils";
import { companyProfileFromKeywords } from "@/lib/company/keyword-profile";
import { resolveDisplayTitle } from "@/lib/solicitations/display-title";
import { buildFinalReport } from "@/lib/reporting/build-report";
import { formatDueDate } from "@/lib/reporting/format-display";
import { synthesizeSentences } from "@/lib/reporting/synthesize-text";
import { buildSolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import type { SolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import { scrapeSolicitationSources } from "@/lib/research/scrape-url";
import { summarizeOpportunity } from "@/lib/research/summarize-opportunity";
import { scoreAcceptanceLikelihood } from "@/lib/scoring/acceptance-likelihood";
import { randomUUID } from "crypto";

export interface AnalysisProgress {
  stage:
    | "loading_solicitations"
    | "profiling_catalog"
    | "matching"
    | "researching"
    | "summarizing"
    | "scoring"
    | "reporting"
    | "complete";
  message: string;
  catalogProfiled?: number;
  catalogTotal?: number;
}

async function analyzeOpportunity(
  company: CompanyProfile,
  match: Awaited<ReturnType<typeof matchSolicitations>>[number],
  profilePool: Map<number, SolicitationProfile>,
): Promise<AnalyzedOpportunity> {
  if (!match?.solicitation) {
    throw new Error("Invalid match: missing solicitation data");
  }

  const { solicitation } = match;
  const displayTitle = resolveDisplayTitle(solicitation);
  const searchQuery = `${displayTitle} ${solicitation.organization} ${solicitation.solicitationType}`;

  const research = await scrapeSolicitationSources(solicitation.link, searchQuery);
  const baseProfile =
    profilePool.get(solicitation.rowIndex) ?? buildSolicitationProfile(solicitation);
  const profile = enrichProfile(baseProfile, solicitation, research);
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
  onProgress?: (progress: AnalysisProgress) => void,
): Promise<AnalysisResult> {
  onProgress?.({
    stage: "loading_solicitations",
    message: "Loading solicitations database…",
  });
  const solicitations = await fetchSolicitations();

  onProgress?.({
    stage: "profiling_catalog",
    message: `Building detailed profiles for all ${solicitations.length} solicitations…`,
    catalogTotal: solicitations.length,
    catalogProfiled: 0,
  });
  const profilePool = loadSolicitationProfilePool(solicitations);

  onProgress?.({
    stage: "matching",
    message: "Matching solicitations to your company profile…",
    catalogTotal: solicitations.length,
    catalogProfiled: solicitations.length,
  });
  const matches = await matchSolicitations(company, solicitations);

  const analyzedOpportunities: AnalyzedOpportunity[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const title = resolveDisplayTitle(match.solicitation);
    onProgress?.({
      stage: "researching",
      message: `Researching opportunity ${i + 1} of ${matches.length}: ${title}`,
    });

    const opportunity = await analyzeOpportunity(company, match, profilePool);
    analyzedOpportunities.push(opportunity);
  }

  onProgress?.({
    stage: "reporting",
    message: "Building your tailored recommendation report…",
  });
  const report = await buildFinalReport(company, analyzedOpportunities, solicitations.length);

  onProgress?.({ stage: "complete", message: "Analysis complete." });

  return {
    id: randomUUID(),
    company,
    catalogProfileCount: solicitations.length,
    analyzedOpportunities,
    report,
  };
}

function buildKeywordMatch(
  query: string,
  solicitation: Awaited<ReturnType<typeof fetchSolicitations>>[number],
): MatchedSolicitation {
  const displayTitle = resolveDisplayTitle(solicitation);
  const score = Math.round(overlapScore(query, solicitationSearchCorpus(solicitation)) * 100);

  return {
    solicitation,
    matchScore: Math.min(100, Math.max(0, score)),
    matchRationale: `Keyword search for "${query}" matched this opportunity's title, description, and catalog keywords (${displayTitle}).`,
  };
}

export async function runKeywordOpportunityAnalysis(
  query: string,
  rowIndex: number,
  onProgress?: (progress: AnalysisProgress) => void,
): Promise<AnalysisResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Search query is required");
  }

  onProgress?.({
    stage: "loading_solicitations",
    message: "Loading solicitations database…",
  });
  const solicitations = await fetchSolicitations();
  const solicitation = solicitations.find((row) => row.rowIndex === rowIndex);
  if (!solicitation) {
    throw new Error("Solicitation not found in catalog");
  }

  const company = companyProfileFromKeywords(trimmed);
  const match = buildKeywordMatch(trimmed, solicitation);
  const profilePool = loadSolicitationProfilePool(solicitations);
  const displayTitle = resolveDisplayTitle(solicitation);

  onProgress?.({
    stage: "researching",
    message: `Researching: ${displayTitle}`,
  });

  const analyzedOpportunity = await analyzeOpportunity(company, match, profilePool);

  onProgress?.({
    stage: "reporting",
    message: "Building your opportunity report…",
  });

  const report = await buildFinalReport(company, [analyzedOpportunity], solicitations.length);
  report.executiveSummary = synthesizeSentences([
    `You searched the catalog for "${trimmed}". The closest match is ${displayTitle} (${solicitation.department}, due ${formatDueDate(solicitation.dueDate)}) with a ${match.matchScore}% keyword relevance score.`,
    `We researched this opportunity and scored acceptance likelihood at ${analyzedOpportunity.acceptance.likelihoodScore}% (${analyzedOpportunity.acceptance.likelihoodLabel.toLowerCase()}). Recommendation: ${analyzedOpportunity.summary.tailored.pursuitRecommendation.toLowerCase()}.`,
    "The brief below summarizes eligibility, funding, requirements, and tailored guidance for this opportunity.",
  ]);
  report.overallStrategy = synthesizeSentences([
    `Download the official solicitation from the link below and confirm ${displayTitle} aligns with your capabilities.`,
    "Build a compliance matrix against stated requirements and validate your TRL against the expected maturity.",
    "For a ranked list across the full catalog, run the full company analysis questionnaire.",
  ]);

  onProgress?.({ stage: "complete", message: "Report complete." });

  return {
    id: randomUUID(),
    company,
    catalogProfileCount: solicitations.length,
    analyzedOpportunities: [analyzedOpportunity],
    report,
  };
}
