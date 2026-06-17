export interface CompanyProfile {
  technologyAndCapabilities: string;
  technologyReadinessLevel: string;
  federalExperienceLevel: string;
  federalExperienceDetails: string;
  governmentFundingSources: string;
  privateFundingSources: string;
  fundingDetails: string;
  teamSize: string;
  targetDepartments: string;
  differentiators: string;
  additionalContext: string;
}

export interface QuestionDefinition {
  id: keyof CompanyProfile;
  label: string;
  /** Why this question matters for matching and reports. */
  whyWeAsk: string;
  /** Practical guidance on what to include in the answer. */
  howToAnswer: string;
  placeholder: string;
  type: "text" | "textarea" | "select" | "multiselect";
  options?: string[];
  required?: boolean;
}

export const GOVERNMENT_FUNDING_OPTIONS = [
  "SBIR / STTR awards",
  "Broad Agency Announcements (BAA)",
  "Other Transaction Authority (OTA)",
  "Federal research grants",
  "State / local government grants",
  "Prize / challenge competitions",
  "Cost-share on federal contracts",
  "None — no government funding yet",
] as const;

export const PRIVATE_FUNDING_OPTIONS = [
  "Venture capital",
  "Angel investors",
  "Private equity",
  "Corporate venture / strategic investment",
  "Accelerator or incubator funding",
  "Bootstrapped / revenue-funded",
  "Friends and family",
  "None — no private external funding",
] as const;

/** Delimiter for multiselect values stored on CompanyProfile string fields. */
export const MULTI_VALUE_SEP = "|";

export function parseMultiValue(value: string): string[] {
  return value
    .split(MULTI_VALUE_SEP)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toggleMultiValue(current: string, option: string, noneOption?: string): string {
  const selected = new Set(parseMultiValue(current));

  if (noneOption && option === noneOption) {
    return selected.has(option) ? "" : option;
  }

  if (noneOption) selected.delete(noneOption);

  if (selected.has(option)) selected.delete(option);
  else selected.add(option);

  return Array.from(selected).join(MULTI_VALUE_SEP);
}

export const COMPANY_QUESTIONS: QuestionDefinition[] = [
  {
    id: "technologyAndCapabilities",
    label: "What technologies and services does your company offer?",
    whyWeAsk:
      "This is the primary signal we use to match you against 290+ solicitations. Vague answers like “innovative solutions” produce weak matches; specific technical language produces strong ones.",
    howToAnswer:
      "Name your products or services, the technical domains you work in (e.g. batteries, photonics, autonomy), and what maturity level you can deliver today. Think: what would a program manager see on your capability brief?",
    placeholder:
      "Example: We develop solid-state battery packs and thermal management systems for defense platforms — from lab prototypes (TRL 4) through pilot manufacturing. We integrate with existing vehicle power buses and have supported DoD energy resilience studies.",
    type: "textarea",
    required: true,
  },
  {
    id: "technologyReadinessLevel",
    label: "How mature is your core technology?",
    whyWeAsk:
      "Solicitations target different maturity levels. SBIR Phase I topics often want TRL 3–5; production contracts may require TRL 7+. We filter out opportunities that are unrealistic for your stage.",
    howToAnswer:
      "Choose the TRL range that describes your typical deliverable, not your most ambitious roadmap item. If you have products at different stages, pick “Mixed across programs.”",
    placeholder: "",
    type: "select",
    options: [
      "TRL 1-3 (basic research)",
      "TRL 4-6 (prototype / demo)",
      "TRL 7-9 (deployed / production)",
      "Mixed across programs",
    ],
    required: true,
  },
  {
    id: "federalExperienceLevel",
    label: "What is your federal contracting experience?",
    whyWeAsk:
      "Past performance shapes which solicitations you can credibly pursue. First-time bidders are better suited to SBIR, prizes, and teaming roles than large prime contracts.",
    howToAnswer:
      "Select the highest level that accurately describes your company today — not where you want to be in two years. Honest answers improve the quality of recommendations.",
    placeholder: "",
    type: "select",
    options: [
      "None yet — seeking first award",
      "SBIR / STTR Phase I",
      "SBIR / STTR Phase II or III",
      "Prime federal contracts",
      "Subcontractor on federal work",
      "Mix of SBIR and prime/sub contracts",
    ],
    required: true,
  },
  {
    id: "federalExperienceDetails",
    label: "Describe your past federal work (optional)",
    whyWeAsk:
      "Specific award history helps us score fit and tells the report what past performance to emphasize in application guidance.",
    howToAnswer:
      "List agency names, contract or grant types, award years, and one-line outcomes. Even a single SBIR Phase I or subcontract is valuable here.",
    placeholder:
      "Example: USAF SBIR Phase I (2023) on deployable power; subcontractor to Lockheed on Army xTech demo; NASA STTR with university partner on thermal coatings.",
    type: "textarea",
    required: false,
  },
  {
    id: "governmentFundingSources",
    label: "What government funding have you received or pursued?",
    whyWeAsk:
      "Different funding paths open different solicitation types — SBIR history points to more SBIR topics; BAA experience suggests BAAs and OTAs are viable.",
    howToAnswer:
      "Select every source that applies. If you have not received any public funding, select “None — no government funding yet.”",
    placeholder: "",
    type: "multiselect",
    options: [...GOVERNMENT_FUNDING_OPTIONS],
    required: true,
  },
  {
    id: "privateFundingSources",
    label: "What private or external funding do you have?",
    whyWeAsk:
      "Commercial innovation programs (DIU, prize challenges, dual-use pathways) often value venture backing or revenue traction alongside technical merit.",
    howToAnswer:
      "Select all capital sources that apply to your company. Bootstrapped companies should select that option rather than leaving the question blank.",
    placeholder: "",
    type: "multiselect",
    options: [...PRIVATE_FUNDING_OPTIONS],
    required: true,
  },
  {
    id: "fundingDetails",
    label: "Any additional funding context? (optional)",
    whyWeAsk:
      "Round size, active grants, and investor names can strengthen cost-share and commercialization narratives in your report.",
    howToAnswer:
      "Briefly note amounts, lead investors, grant numbers, or whether you are between funding phases. Skip if nothing useful to add.",
    placeholder:
      "Example: $4M Series A led by defense-focused VC; active NSF grant; completing Phase I and preparing Phase II bridge.",
    type: "textarea",
    required: false,
  },
  {
    id: "teamSize",
    label: "How large is your team?",
    whyWeAsk:
      "Team size affects whether you should pursue as prime, subcontractor, or through SBIR — a 5-person team faces different realistic paths than a 150-person firm.",
    howToAnswer:
      "Count full-time employees (approximate is fine). Include engineers and program staff; exclude part-time advisors unless they are core to delivery.",
    placeholder: "",
    type: "select",
    options: ["1-10 employees", "11-50 employees", "51-200 employees", "200+ employees"],
    required: true,
  },
  {
    id: "targetDepartments",
    label: "Which agency do you most want to work with?",
    whyWeAsk:
      "We boost solicitations from agencies you prioritize, so your top picks reflect where you actually want to compete.",
    howToAnswer:
      "Pick your primary target. If you pursue multiple DoD components equally, choose “Multiple DoD components” and name specifics in the last optional question.",
    placeholder: "",
    type: "select",
    options: [
      "Air Force / Space Force",
      "Army",
      "Navy / Marine Corps",
      "NASA",
      "DHS",
      "DOE / NNSA",
      "SOCOM",
      "Multiple DoD components",
      "Other agency",
    ],
    required: true,
  },
  {
    id: "differentiators",
    label: "What makes you competitive on federal bids?",
    whyWeAsk:
      "Evaluators need a reason to pick you over incumbents. This directly feeds the “what to emphasize in your application” section of your report.",
    howToAnswer:
      "List concrete advantages: patents, measured performance gains, certifications, cleared personnel, manufacturing capacity, or key partnerships. Avoid generic claims like “great team.”",
    placeholder:
      "Example: Patented ceramic coating with 3× wear life vs. incumbents; ITAR-registered facility; TS-ready engineering lead; existing CRADA with a national lab.",
    type: "textarea",
    required: true,
  },
  {
    id: "additionalContext",
    label: "Anything else we should know? (optional)",
    whyWeAsk:
      "Eligibility rules, clearances, and teaming preferences can change which solicitations are viable — this catches constraints the other questions miss.",
    howToAnswer:
      "Note small business status, facility clearances, geographic limits, openness to teaming, or anything that would affect whether you can bid as prime.",
    placeholder:
      "Example: US small business, CAGE registered, prefer unclassified work, open to university partnerships, cannot support on-site OCONUS deployments.",
    type: "textarea",
    required: false,
  },
];

export const EMPTY_COMPANY_PROFILE: CompanyProfile = {
  technologyAndCapabilities: "",
  technologyReadinessLevel: "",
  federalExperienceLevel: "",
  federalExperienceDetails: "",
  governmentFundingSources: "",
  privateFundingSources: "",
  fundingDetails: "",
  teamSize: "",
  targetDepartments: "",
  differentiators: "",
  additionalContext: "",
};

/** Flat text used for keyword matching across the profile. */
export function companyProfileText(company: CompanyProfile): string {
  return [
    company.technologyAndCapabilities,
    company.federalExperienceLevel,
    company.federalExperienceDetails,
    company.governmentFundingSources.replaceAll(MULTI_VALUE_SEP, " "),
    company.privateFundingSources.replaceAll(MULTI_VALUE_SEP, " "),
    company.fundingDetails,
    company.differentiators,
    company.additionalContext,
  ].join(" ");
}

/** Experience string for SBIR/BAA type scoring. */
export function federalExperienceText(company: CompanyProfile): string {
  return `${company.federalExperienceLevel} ${company.federalExperienceDetails} ${company.governmentFundingSources}`.toLowerCase();
}

export function privateFundingText(company: CompanyProfile): string {
  return `${company.privateFundingSources} ${company.fundingDetails}`.toLowerCase();
}
