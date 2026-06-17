import type { CompanyProfile } from "@/lib/company/questionnaire";
import { federalExperienceText, parseMultiValue } from "@/lib/company/questionnaire";
import type { AcceptanceAssessment } from "@/lib/domain/types";
import { departmentMatchesTarget } from "@/lib/matching/department-match";
import { overlapScore } from "@/lib/matching/text-utils";
import type { SolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import type { SolicitationRow } from "@/lib/solicitations/types";

function labelFromScore(score: number): AcceptanceAssessment["likelihoodLabel"] {
  if (score >= 75) return "Very High";
  if (score >= 58) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

export async function scoreAcceptanceLikelihood(
  company: CompanyProfile,
  solicitation: SolicitationRow,
  profile: SolicitationProfile,
): Promise<AcceptanceAssessment> {
  let score = 45;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendedActions: string[] = [];

  const fitScore = overlapScore(
    company.technologyAndCapabilities,
    [profile.displayTitle, profile.keyWords, profile.summary].join(" "),
  );

  if (fitScore >= 0.3) {
    score += 12;
    strengths.push("Technology keywords overlap with your stated capabilities.");
  }
  if (departmentMatchesTarget(company.targetDepartments, solicitation.department)) {
    score += 8;
    strengths.push(`Active interest in ${solicitation.department} matches this opportunity.`);
  }

  if (company.federalExperienceDetails.trim().length > 30) {
    score += 10;
    strengths.push("Documented federal contract experience in company profile.");
  } else if (!company.federalExperienceLevel.toLowerCase().includes("none")) {
    score += 5;
    strengths.push(`Federal experience level: ${company.federalExperienceLevel}.`);
  } else {
    score -= 8;
    weaknesses.push("Limited federal past performance cited.");
    recommendedActions.push("Strengthen past performance narrative and identify teaming partners.");
  }

  if (
    federalExperienceText(company).includes("sbir") &&
    solicitation.solicitationType.toLowerCase().includes("sbir")
  ) {
    score += 12;
    strengths.push("Prior SBIR/STTR history relevant to this solicitation type.");
  }

  if (profile.catalogGaps.length > 0) {
    score -= Math.min(12, profile.catalogGaps.length * 3);
    weaknesses.push(`Catalog incomplete: ${profile.catalogGaps.slice(0, 2).join("; ")}.`);
  }

  if (fitScore < 0.2) {
    score -= 6;
    weaknesses.push("Low keyword overlap — may require teaming or scope stretch.");
  }

  if (!profile.link) {
    score -= 5;
    recommendedActions.push("Confirm solicitation URL and download the official RFP/BAA package.");
  }

  if (company.differentiators.trim()) {
    strengths.push(`Differentiator: ${company.differentiators.slice(0, 120)}`);
  }

  const govFunding = parseMultiValue(company.governmentFundingSources);
  const privateFunding = parseMultiValue(company.privateFundingSources);
  if (
    govFunding.some((f) => f.includes("SBIR")) &&
    solicitation.solicitationType.toLowerCase().includes("sbir")
  ) {
    score += 4;
    strengths.push("SBIR/STTR funding history aligns with this solicitation type.");
  }
  if (
    privateFunding.some((f) => f.toLowerCase().includes("venture")) &&
    (solicitation.solicitationType.toLowerCase().includes("commercial") ||
      profile.organization.toLowerCase().includes("diu"))
  ) {
    score += 3;
    strengths.push("Venture-backed profile may fit commercial innovation pathways.");
  }

  if (profile.portfolioFlags.length > 0) {
    score += 5;
    strengths.push(`Catalog flags thematic relevance for ${profile.portfolioFlags.join(", ")}.`);
  }

  recommendedActions.push("Map solicitation requirements to a compliance matrix before bid decision.");
  if (profile.link) {
    recommendedActions.push(`Review full solicitation at ${profile.link}`);
  }

  if (profile.requirements.toLowerCase().includes("quad chart")) {
    recommendedActions.push("Prepare a quad chart early — often required for first-stage review.");
  }

  const likelihoodScore = Math.min(100, Math.max(5, Math.round(score)));

  return {
    likelihoodScore,
    likelihoodLabel: labelFromScore(likelihoodScore),
    rationale: `Score reflects profile fit (${Math.round(fitScore * 100)}% keyword overlap), solicitation type alignment, federal experience depth, and catalog completeness.`,
    strengths: strengths.length ? strengths : ["General technology adjacency to solicitation scope."],
    weaknesses: weaknesses.length ? weaknesses : ["Competitive field and incomplete catalog metadata add uncertainty."],
    recommendedActions,
  };
}
