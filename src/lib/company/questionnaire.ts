export interface CompanyProfile {
  companyName: string;
  technologyAreas: string;
  capabilities: string;
  productsAndServices: string;
  technologyReadinessLevel: string;
  federalExperience: string;
  sbirSttrHistory: string;
  teamSize: string;
  targetDepartments: string;
  businessStatus: string;
  differentiators: string;
  fundingStage: string;
  additionalContext: string;
}

export interface QuestionDefinition {
  id: keyof CompanyProfile;
  label: string;
  description: string;
  placeholder: string;
  type: "text" | "textarea" | "select";
  options?: string[];
  required?: boolean;
}

export const COMPANY_QUESTIONS: QuestionDefinition[] = [
  {
    id: "companyName",
    label: "Company name",
    description: "Legal or trade name used on proposals.",
    placeholder: "Acme Defense Technologies",
    type: "text",
    required: true,
  },
  {
    id: "technologyAreas",
    label: "Primary technology areas",
    description: "Core R&D domains, materials, or mission areas.",
    placeholder: "Advanced materials, photonics, energy storage",
    type: "textarea",
    required: true,
  },
  {
    id: "capabilities",
    label: "Technical capabilities",
    description: "What you can deliver: prototyping, testing, manufacturing, etc.",
    placeholder: "Lab-scale prototyping, pilot production, systems integration",
    type: "textarea",
    required: true,
  },
  {
    id: "productsAndServices",
    label: "Products and services",
    description: "Current offerings relevant to federal opportunities.",
    placeholder: "Solar receivers, thermal storage modules, engineering services",
    type: "textarea",
    required: true,
  },
  {
    id: "technologyReadinessLevel",
    label: "Technology readiness level (TRL)",
    description: "Typical TRL of your core technology.",
    placeholder: "TRL 4-6",
    type: "select",
    options: ["TRL 1-3", "TRL 4-6", "TRL 7-9", "Mixed / program-dependent"],
    required: true,
  },
  {
    id: "federalExperience",
    label: "Federal contract experience",
    description: "Prior agencies, contract types, and outcomes.",
    placeholder: "DoD SBIR Phase I (2022), NASA research grant",
    type: "textarea",
    required: true,
  },
  {
    id: "sbirSttrHistory",
    label: "SBIR / STTR history",
    description: "Phase I/II awards, topics pursued, transition success.",
    placeholder: "Two Phase I SBIRs; one Phase II in progress",
    type: "textarea",
    required: false,
  },
  {
    id: "teamSize",
    label: "Team size",
    description: "Full-time employees and key subcontractors.",
    placeholder: "18 FTEs, 3 part-time advisors",
    type: "text",
    required: true,
  },
  {
    id: "targetDepartments",
    label: "Target departments / agencies",
    description: "Where you want to compete.",
    placeholder: "Air Force, NASA, SOCOM",
    type: "text",
    required: true,
  },
  {
    id: "businessStatus",
    label: "Business status",
    description: "Small business designations, clearances, location.",
    placeholder: "US small business, CAGE registered, California HQ",
    type: "textarea",
    required: false,
  },
  {
    id: "differentiators",
    label: "Competitive differentiators",
    description: "Why you win against peers.",
    placeholder: "Patented coating process, 3x efficiency vs incumbents",
    type: "textarea",
    required: true,
  },
  {
    id: "fundingStage",
    label: "Funding stage",
    description: "Bootstrapped, seed, Series A, revenue-funded, etc.",
    placeholder: "Seed-funded, $2M runway",
    type: "text",
    required: false,
  },
  {
    id: "additionalContext",
    label: "Anything else we should know?",
    description: "Constraints, partnerships, or strategic goals.",
    placeholder: "Seeking first BAA win; open to teaming",
    type: "textarea",
    required: false,
  },
];

export const EMPTY_COMPANY_PROFILE: CompanyProfile = {
  companyName: "",
  technologyAreas: "",
  capabilities: "",
  productsAndServices: "",
  technologyReadinessLevel: "",
  federalExperience: "",
  sbirSttrHistory: "",
  teamSize: "",
  targetDepartments: "",
  businessStatus: "",
  differentiators: "",
  fundingStage: "",
  additionalContext: "",
};
