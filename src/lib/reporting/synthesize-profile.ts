import type { SolicitationProfile } from "./build-solicitation-profile";
import { synthesizeSections } from "./synthesize-text";
import type { TailoredOpportunityReport } from "./tailor-to-company";

export function synthesizeTailoredAssessment(
  profile: SolicitationProfile,
  tailored: TailoredOpportunityReport,
  matchRationale: string,
): string {
  return synthesizeSections([
    {
      label: "Fit:",
      body: `${tailored.whyApply} ${matchRationale}`,
    },
    {
      label: "Likelihood of success:",
      body: tailored.likelihoodNarrative,
    },
    {
      label: "Application guidance:",
      body: tailored.applicationGuidance,
    },
    {
      label: "Teaming and eligibility:",
      body: tailored.teamingAndEligibility,
    },
    {
      label: "Risks to address:",
      body: tailored.risksForCompany.join(" "),
    },
  ]);
}
