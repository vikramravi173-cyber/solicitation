import {
  EMPTY_COMPANY_PROFILE,
  type CompanyProfile,
} from "@/lib/company/questionnaire";

/** Minimal company profile for keyword-only opportunity reports. */
export function companyProfileFromKeywords(query: string): CompanyProfile {
  const trimmed = query.trim();
  return {
    ...EMPTY_COMPANY_PROFILE,
    technologyAndCapabilities: trimmed,
    technologyReadinessLevel: "Mixed across programs",
    federalExperienceLevel: "None yet — seeking first award",
    governmentFundingSources: "None — no government funding yet",
    privateFundingSources: "Bootstrapped / revenue-funded",
    teamSize: "1-10 employees",
    targetDepartments: "Multiple DoD components",
    differentiators: trimmed,
  };
}
