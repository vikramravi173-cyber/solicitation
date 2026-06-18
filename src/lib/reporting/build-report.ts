import type { CompanyProfile } from "@/lib/company/questionnaire";
import { companyDisplayLabel, federalExperienceText, parseMultiValue } from "@/lib/company/questionnaire";
import type { AnalyzedOpportunity, FinalReport } from "@/lib/domain/types";
import { formatDueDate } from "@/lib/reporting/format-display";
import { synthesizeSentences } from "./synthesize-text";

export async function buildFinalReport(
  company: CompanyProfile,
  opportunities: AnalyzedOpportunity[],
  catalogProfileCount: number,
): Promise<FinalReport> {
  const ranked = [...opportunities].sort((a, b) => {
    const scoreA = a.match.matchScore * 0.5 + a.acceptance.likelihoodScore * 0.5;
    const scoreB = b.match.matchScore * 0.5 + b.acceptance.likelihoodScore * 0.5;
    return scoreB - scoreA;
  });

  const recommendedOpportunities = ranked.map((opp, index) => {
    const title = opp.summary.profile.displayTitle;

    return {
      rank: index + 1,
      title,
      solicitationNumber: opp.match.solicitation.solicitationNumber,
      department: opp.match.solicitation.department,
      dueDate: formatDueDate(opp.match.solicitation.dueDate),
      link: opp.match.solicitation.link,
      likelihoodScore: opp.acceptance.likelihoodScore,
      likelihoodLabel: opp.acceptance.likelihoodLabel,
      pursuitRecommendation: opp.summary.tailored.pursuitRecommendation,
      whyRecommended: synthesizeSentences([
        opp.summary.tailored.whyApply,
        `Likelihood of success: ${opp.acceptance.likelihoodLabel.toLowerCase()} (${opp.acceptance.likelihoodScore}%). ${opp.summary.tailored.pursuitRecommendation}.`,
      ]),
    };
  });

  const top = recommendedOpportunities[0];
  const executiveSummary = synthesizeSentences([
    `We profiled all ${catalogProfileCount} entries in the Gov Events & Opportunities catalog against ${companyDisplayLabel(company)}'s intake answers, then researched and scored your top ${recommendedOpportunities.length} matches.`,
    top
      ? `Your strongest match is ${top.title} (${top.department}, due ${top.dueDate}) — ${top.likelihoodLabel.toLowerCase()} likelihood of success at ${top.likelihoodScore}%, with a recommendation to ${top.pursuitRecommendation.toLowerCase()}.`
      : "No strong matches surfaced; consider broadening your target agencies or technology description and re-running the analysis.",
    "The following sections combine solicitation intelligence with tailored guidance on fit, likelihood, and what to emphasize in your application.",
  ]);

  const govFunding = parseMultiValue(company.governmentFundingSources);
  const privateFunding = parseMultiValue(company.privateFundingSources);

  const overallStrategy = synthesizeSentences([
    `Focus capture efforts on your top ${Math.min(3, recommendedOpportunities.length)} ranked opportunities and assign owners within the next week.`,
    `For each pursuit, build a compliance matrix and confirm your stated TRL (${company.technologyReadinessLevel}) meets the expected maturity.`,
    federalExperienceText(company).includes("sbir")
      ? `Your ${company.federalExperienceLevel} background is an asset — lead proposal narratives with relevant SBIR/STTR or contract outcomes.`
      : "If past performance is thin, line up an experienced prime or agency sponsor before committing significant bid resources.",
    govFunding.length > 0 && !govFunding[0]?.startsWith("None")
      ? `Where cost-share matters, reference your government funding track record (${govFunding.join("; ")}).`
      : "",
    privateFunding.length > 0 && !privateFunding[0]?.startsWith("None")
      ? `Where commercial traction matters, note your private capital position (${privateFunding.join("; ")}).`
      : "",
    "Re-run this analysis whenever you update the catalog or refine your company profile.",
  ].filter(Boolean) as string[]);

  return {
    executiveSummary,
    recommendedOpportunities,
    overallStrategy,
    generatedAt: new Date().toISOString(),
  };
}
