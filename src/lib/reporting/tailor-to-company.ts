import type { CompanyProfile } from "@/lib/company/questionnaire";
import { federalExperienceText, parseMultiValue } from "@/lib/company/questionnaire";
import type { AcceptanceAssessment, MatchedSolicitation } from "@/lib/domain/types";
import { departmentMatchesTarget } from "@/lib/matching/department-match";
import { overlapScore } from "@/lib/matching/text-utils";
import type { SolicitationProfile } from "./build-solicitation-profile";
import { synthesizeNarrative, synthesizeSentences, synthesizeTalkingPoints } from "./synthesize-text";

export interface TailoredOpportunityReport {
  whyApply: string;
  likelihoodNarrative: string;
  applicationTalkingPoints: string[];
  /** Cohesive prose version of application talking points. */
  applicationGuidance: string;
  teamingAndEligibility: string;
  risksForCompany: string[];
  /** Single flowing brief combining fit, likelihood, guidance, and risks. */
  fullBrief: string;
  pursuitRecommendation: "Strong pursue" | "Pursue with teaming" | "Monitor" | "Low priority";
}

function matchingKeywords(company: CompanyProfile, profile: SolicitationProfile): string[] {
  const corpus = [
    profile.displayTitle,
    profile.keyWords,
    profile.summary,
    profile.solicitationType,
    profile.organization,
  ].join(" ");

  const companyTokens = company.technologyAndCapabilities
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const seen = new Set<string>();
  const hits: string[] = [];
  const lower = corpus.toLowerCase();

  for (const token of companyTokens) {
    if (lower.includes(token) && !seen.has(token)) {
      seen.add(token);
      hits.push(token);
      if (hits.length >= 8) break;
    }
  }
  return hits;
}

function pursuitLevel(
  matchScore: number,
  likelihoodScore: number,
): TailoredOpportunityReport["pursuitRecommendation"] {
  const combined = matchScore * 0.5 + likelihoodScore * 0.5;
  if (combined >= 70) return "Strong pursue";
  if (combined >= 55) return "Pursue with teaming";
  if (combined >= 40) return "Monitor";
  return "Low priority";
}

export function tailorProfileToCompany(
  company: CompanyProfile,
  profile: SolicitationProfile,
  match: MatchedSolicitation,
  acceptance: AcceptanceAssessment,
): TailoredOpportunityReport {
  const matchRationale =
    match?.matchRationale?.trim() ||
    "your capabilities and target agencies show alignment with this solicitation";

  const matchScore = match?.matchScore ?? 0;
  const keywords = matchingKeywords(company, profile);
  const fitScore = overlapScore(
    company.technologyAndCapabilities,
    [profile.displayTitle, profile.keyWords, profile.summary].join(" "),
  );

  const whyApplySupporting: string[] = [];
  if (keywords.length > 0) {
    whyApplySupporting.push(
      `Your capabilities map to this solicitation's focus on ${keywords.slice(0, 5).join(", ")}${keywords.length > 5 ? ", and related areas" : ""}.`,
    );
  }
  if (departmentMatchesTarget(company.targetDepartments, profile.department)) {
    whyApplySupporting.push(
      `It aligns with your stated priority to pursue work with ${profile.department}, making this a strategic fit rather than an opportunistic bid.`,
    );
  }
  if (profile.portfolioFlags.length > 0) {
    whyApplySupporting.push(
      `The catalog also flags thematic relevance for companies in the ${profile.portfolioFlags.join(", ")} space.`,
    );
  }

  const whyApply = synthesizeSentences([
    `This opportunity warrants your attention because ${matchRationale}`,
    ...whyApplySupporting,
  ]);

  const likelihoodNarrative = synthesizeSentences([
    `We assess your likelihood of success as ${acceptance.likelihoodLabel.toLowerCase()} (${acceptance.likelihoodScore}%), reflecting how well your profile matches this solicitation, your federal experience, and how complete the available catalog data is.`,
    acceptance.rationale,
    fitScore >= 0.3
      ? `Your technology description shows strong thematic overlap with this opportunity.`
      : `Thematic overlap is moderate; lean on differentiators and teaming to strengthen the proposal.`,
  ]);

  const applicationTalkingPoints: string[] = [];

  applicationTalkingPoints.push(
    `Open with how your core technology (${company.technologyAndCapabilities.slice(0, 150)}…) directly addresses the solicitation's technical scope.`,
  );

  if (company.differentiators.trim()) {
    applicationTalkingPoints.push(`Highlight differentiators: ${company.differentiators}`);
  }

  applicationTalkingPoints.push(
    `Map your TRL (${company.technologyReadinessLevel}) to the solicitation's expected maturity and include a clear transition plan.`,
  );

  if (federalExperienceText(company).includes("sbir") && profile.solicitationType.toLowerCase().includes("sbir")) {
    applicationTalkingPoints.push(
      "Reference prior SBIR/STTR awards and Phase transitions in your qualifications volume.",
    );
  }

  const govFunding = parseMultiValue(company.governmentFundingSources);
  if (govFunding.length > 0 && !govFunding[0]?.startsWith("None")) {
    applicationTalkingPoints.push(
      `Note government funding history (${govFunding.join("; ")}) where cost-share or credibility matters.`,
    );
  }

  if (profile.evaluationCriteria.toLowerCase().includes("%")) {
    applicationTalkingPoints.push(
      "Structure your proposal sections to mirror the published evaluation weightings — lead with the highest-weighted criteria.",
    );
  }

  applicationTalkingPoints.push(
    ...acceptance.recommendedActions.slice(0, 3),
  );

  const applicationGuidance = synthesizeTalkingPoints(applicationTalkingPoints);

  let teamingAndEligibility = profile.whoCanSubmit;
  if (profile.applicants.toLowerCase().includes("govt") || profile.applicants.toLowerCase().includes("govt only")) {
    teamingAndEligibility = synthesizeSentences([
      teamingAndEligibility,
      `You likely cannot submit as prime; identify a ${profile.department} sponsor and position your firm as the industry teammate delivering the technical solution.`,
    ]);
  } else if (company.federalExperienceLevel.toLowerCase().includes("none")) {
    teamingAndEligibility = synthesizeSentences([
      teamingAndEligibility,
      "Limited federal experience suggests pursuing as a subcontractor to an experienced prime while you build past performance.",
    ]);
  }

  const risksForCompany = [...acceptance.weaknesses];
  if (profile.catalogGaps.length > 0) {
    risksForCompany.push(`Catalog data gaps: ${profile.catalogGaps.join("; ")} — verify before committing bid resources.`);
  }

  const risksNarrative =
    risksForCompany.length > 0
      ? synthesizeSentences([
          `Before bidding, account for the following risks: ${risksForCompany.slice(0, 3).join("; ")}.`,
        ])
      : "";

  const fullBrief = synthesizeNarrative(
    [whyApply, likelihoodNarrative, applicationGuidance, teamingAndEligibility, risksNarrative].filter(
      Boolean,
    ),
    [
      "Looking at your odds,",
      "In your application,",
      "On teaming and eligibility,",
      "Finally,",
    ],
  );

  return {
    whyApply,
    likelihoodNarrative,
    applicationTalkingPoints,
    applicationGuidance,
    teamingAndEligibility,
    risksForCompany,
    fullBrief,
    pursuitRecommendation: pursuitLevel(matchScore, acceptance.likelihoodScore),
  };
}
