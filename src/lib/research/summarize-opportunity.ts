import type { CompanyProfile } from "@/lib/company/questionnaire";
import { companyCapabilityText, federalExperienceText } from "@/lib/company/questionnaire";
import type {
  AcceptanceAssessment,
  MatchedSolicitation,
  OpportunitySummary,
  ScrapedContent,
} from "@/lib/domain/types";
import { overlapScore } from "@/lib/matching/text-utils";
import { departmentMatchesTarget } from "@/lib/matching/department-match";
import type { SolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import { buildSolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import { tailorProfileToCompany } from "@/lib/reporting/tailor-to-company";
import type { SolicitationRow } from "@/lib/solicitations/types";

export async function summarizeOpportunity(
  company: CompanyProfile,
  solicitation: SolicitationRow,
  research: ScrapedContent,
  match: MatchedSolicitation,
  acceptance: AcceptanceAssessment,
  profileInput?: SolicitationProfile,
): Promise<OpportunitySummary> {
  const profile = profileInput ?? (await buildSolicitationProfile(solicitation, research));
  const tailored = await tailorProfileToCompany(company, profile, match, acceptance);

  const fitScore = overlapScore(
    companyCapabilityText(company),
    [profile.displayTitle, profile.keyWords, profile.summary].join(" "),
  );

  const fitHighlights: string[] = [];
  if (fitScore >= 0.3) {
    fitHighlights.push("Technology keywords overlap with your stated capabilities.");
  }
  if (departmentMatchesTarget(company.targetDepartments, solicitation.department)) {
    fitHighlights.push(`Targets your preferred department: ${solicitation.department}.`);
  }
  if (
    federalExperienceText(company).includes("sbir") &&
    solicitation.solicitationType.toLowerCase().includes("sbir")
  ) {
    fitHighlights.push("SBIR/STTR alignment with your award history.");
  }
  if (profile.portfolioFlags.length > 0) {
    fitHighlights.push(`Catalog flags relevance for: ${profile.portfolioFlags.join(", ")}.`);
  }
  if (fitHighlights.length === 0) {
    fitHighlights.push("Potential adjacency based on federal market focus and catalog metadata.");
  }

  const keyRequirements: string[] = [];
  if (profile.applicants) keyRequirements.push(`Eligible applicants: ${profile.applicants}`);
  if (profile.solicitationType) {
    keyRequirements.push(`Solicitation type: ${profile.solicitationType}`);
  }
  if (profile.organization) {
    keyRequirements.push(`Issuing organization: ${profile.organization}`);
  }
  if (profile.dueDate) keyRequirements.push(`Due date: ${profile.dueDate}`);
  if (profile.solicitationNumber) {
    keyRequirements.push(`Solicitation #: ${profile.solicitationNumber}`);
  }

  const risksAndGaps = [...tailored.risksForCompany];
  if (!profile.link) risksAndGaps.push("No solicitation URL in catalog — verify details manually.");
  if (fitScore < 0.2) risksAndGaps.push("Low keyword overlap — may require teaming or scope stretch.");

  const synthesizedBrief = [profile.synthesizedOverview, tailored.fullBrief]
    .filter(Boolean)
    .join("\n\n");

  const onePageSummary = synthesizedBrief;

  return {
    solicitationNumber: profile.solicitationNumber,
    title: profile.displayTitle,
    profile,
    tailored,
    synthesizedBrief,
    onePageSummary,
    keyRequirements,
    fitHighlights,
    risksAndGaps,
    sourcesUsed: profile.sourcesUsed,
  };
}
