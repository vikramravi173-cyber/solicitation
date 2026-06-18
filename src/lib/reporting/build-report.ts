import type { CompanyProfile } from "@/lib/company/questionnaire";
import { companyDisplayLabel, federalExperienceText, parseMultiValue } from "@/lib/company/questionnaire";
import type { AnalyzedOpportunity, FinalReport } from "@/lib/domain/types";
import { formatDueDate } from "@/lib/reporting/format-display";
import { synthesizeBullets } from "./synthesize-text";

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
      whyRecommended: synthesizeBullets([
        ...opp.summary.tailored.whyApply.split(/\n+/).map((l) => l.replace(/^•\s*/, "")),
        `${opp.acceptance.likelihoodLabel} fit (${opp.acceptance.likelihoodScore}%) — ${opp.summary.tailored.pursuitRecommendation}`,
      ]),
    };
  });

  const top = recommendedOpportunities[0];
  const executiveSummary = synthesizeBullets([
    `Screened ${catalogProfileCount} catalog entries against ${companyDisplayLabel(company)}'s profile; ${recommendedOpportunities.length} top matches below.`,
    top
      ? `Best match: ${top.title} (${top.department}, due ${top.dueDate}) — ${top.likelihoodScore}% fit, ${top.pursuitRecommendation.toLowerCase()}.`
      : "No strong matches — broaden target agencies or technology description and re-run.",
    "Each section below gives fit rationale, key facts, and concrete next steps.",
  ]);

  const govFunding = parseMultiValue(company.governmentFundingSources);
  const privateFunding = parseMultiValue(company.privateFundingSources);

  const overallStrategy = synthesizeBullets([
    `Assign owners to your top ${Math.min(3, recommendedOpportunities.length)} pursuits this week.`,
    `Build a compliance matrix per solicitation; confirm TRL ${company.technologyReadinessLevel} meets expected maturity.`,
    federalExperienceText(company).includes("sbir")
      ? `Lead with SBIR/STTR outcomes — your ${company.federalExperienceLevel} experience is a differentiator.`
      : "Thin past performance? Line up an experienced prime before committing bid resources.",
    govFunding.length > 0 && !govFunding[0]?.startsWith("None")
      ? `Reference government funding (${govFunding.join("; ")}) where cost-share matters.`
      : "",
    privateFunding.length > 0 && !privateFunding[0]?.startsWith("None")
      ? `Note private capital (${privateFunding.join("; ")}) where commercial traction matters.`
      : "",
    "Re-run analysis when the catalog updates or your company profile changes.",
  ].filter(Boolean) as string[]);

  return {
    executiveSummary,
    recommendedOpportunities,
    overallStrategy,
    generatedAt: new Date().toISOString(),
  };
}
