import type { CompanyProfile } from "@/lib/company/questionnaire";
import type { AnalysisResult, AnalyzedOpportunity } from "@/lib/domain/types";
import { fetchSolicitations } from "@/lib/data/solicitations-store";
import { matchSolicitations } from "@/lib/matching/match-solicitations";
import { buildFinalReport } from "@/lib/reporting/build-report";
import { scrapeSolicitationSources } from "@/lib/research/scrape-url";
import { summarizeOpportunity } from "@/lib/research/summarize-opportunity";
import { scoreAcceptanceLikelihood } from "@/lib/scoring/acceptance-likelihood";
import { randomUUID } from "crypto";

export interface AnalysisProgress {
  stage:
    | "loading_solicitations"
    | "matching"
    | "researching"
    | "summarizing"
    | "scoring"
    | "reporting"
    | "complete";
  message: string;
}

async function analyzeOpportunity(
  company: CompanyProfile,
  match: Awaited<ReturnType<typeof matchSolicitations>>[number],
): Promise<AnalyzedOpportunity> {
  const { solicitation } = match;
  const searchQuery = `${solicitation.title} ${solicitation.organization} ${solicitation.solicitationType}`;

  const research = await scrapeSolicitationSources(solicitation.link, searchQuery);
  const summary = await summarizeOpportunity(company, solicitation, research);
  const acceptance = await scoreAcceptanceLikelihood(company, solicitation, summary);

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
    stage: "matching",
    message: "Matching solicitations to your company profile…",
  });
  const matches = await matchSolicitations(company, solicitations);

  const analyzedOpportunities: AnalyzedOpportunity[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    onProgress?.({
      stage: "researching",
      message: `Researching opportunity ${i + 1} of ${matches.length}: ${match.solicitation.title}`,
    });

    const opportunity = await analyzeOpportunity(company, match);
    analyzedOpportunities.push(opportunity);
  }

  onProgress?.({
    stage: "reporting",
    message: "Building your one-page recommendation report…",
  });
  const report = await buildFinalReport(company, analyzedOpportunities);

  onProgress?.({ stage: "complete", message: "Analysis complete." });

  return {
    id: randomUUID(),
    company,
    analyzedOpportunities,
    report,
  };
}
