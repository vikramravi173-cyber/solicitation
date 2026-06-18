import type { CompanyProfile } from "@/lib/company/questionnaire";
import { companyCapabilityText } from "@/lib/company/questionnaire";
import type { AcceptanceAssessment, MatchedSolicitation } from "@/lib/domain/types";
import { overlapScore } from "@/lib/matching/text-utils";
import { callClaude } from "@/lib/ai/call-claude";
import type { SolicitationProfile } from "./build-solicitation-profile";

export interface TailoredOpportunityReport {
  whyApply: string;
  likelihoodNarrative: string;
  applicationTalkingPoints: string[];
  applicationGuidance: string;
  teamingAndEligibility: string;
  risksForCompany: string[];
  fullBrief: string;
  pursuitRecommendation: "Strong pursue" | "Pursue with teaming" | "Monitor" | "Low priority";
}

const TAILOR_SYSTEM = `You are a federal grants analyst writing pursuit intelligence briefs for a government affairs consultancy.
Rules:
- Write in plain, direct prose. No bullet points unless asked.
- Never repeat the opportunity title or company name more than once per response.
- Each response must contain ONLY new information — do not restate the input data back.
- Be specific. Generic observations like "your capabilities align" are not acceptable.
- Maximum 3 sentences per response unless instructed otherwise.
- No em dashes.`;

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

export async function tailorProfileToCompany(
  company: CompanyProfile,
  profile: SolicitationProfile,
  match: MatchedSolicitation,
  acceptance: AcceptanceAssessment,
): Promise<TailoredOpportunityReport> {
  const capabilityText = companyCapabilityText(company);
  const matchScore = match?.matchScore ?? 0;
  const fitScore = overlapScore(
    capabilityText,
    [profile.displayTitle, profile.keyWords, profile.summary].join(" "),
  );

  const context = `
OPPORTUNITY: ${profile.displayTitle}
Agency: ${profile.department}${profile.organization ? ` / ${profile.organization}` : ""}
Type: ${profile.solicitationType || "Not specified"}
Due: ${profile.dueDate || "Not listed"}
Focus areas: ${profile.keyWords || "Not listed"}
Funding: ${profile.funding || "Not listed"}
Eligibility: ${profile.applicants || "Not listed"}
Evaluation criteria: ${profile.evaluationCriteria || "Not listed"}
Submission requirements: ${profile.requirements || "Not listed"}

COMPANY:
Capabilities: ${capabilityText || "Not specified"}
Federal experience: ${company.federalExperienceLevel}${company.federalExperienceDetails ? ` — ${company.federalExperienceDetails}` : ""}
Differentiators: ${company.differentiators || "None listed"}
TRL: ${company.technologyReadinessLevel || "Not specified"}
SBIR/STTR history: ${company.sbirSttrHistory || "None"}
Business status: ${company.businessStatus || "Not specified"}
Target agencies: ${company.targetDepartments || "Not specified"}

SCORES: Keyword match ${matchScore}%, Acceptance likelihood ${acceptance.likelihoodScore}% (${acceptance.likelihoodLabel})
`.trim();

  const [whyApply, applicationGuidance, teamingAndEligibility] = await Promise.all([
    callClaude({
      system: TAILOR_SYSTEM,
      prompt: `${context}

Write a 2-3 sentence "Why it fits" section. Explain specifically why this company's capabilities match this opportunity's technical scope. Reference actual capability and focus area details from above — do not use generic alignment language.`,
    }),
    callClaude({
      system: TAILOR_SYSTEM,
      prompt: `${context}

Write 3-4 sentences of application strategy guidance. Be specific to this opportunity's evaluation criteria and submission structure. Tell the company exactly what to lead with, what to address explicitly, and what would strengthen the proposal. Do not repeat the opportunity title.`,
    }),
    callClaude({
      system: TAILOR_SYSTEM,
      prompt: `${context}

Write 1-2 sentences on teaming and eligibility specific to this opportunity. If the company has limited federal experience, say who they should team with and why. If they can compete directly, confirm that and note any conditions.`,
    }),
  ]);

  const likelihoodNarrative = [
    `Likelihood of success assessed at ${acceptance.likelihoodScore}% (${acceptance.likelihoodLabel.toLowerCase()}), based on ${Math.round(fitScore * 100)}% keyword overlap, ${company.federalExperienceLevel.toLowerCase()} federal experience, and catalog data completeness.`,
    acceptance.rationale,
  ].filter(Boolean).join(" ");

  const applicationTalkingPoints = applicationGuidance
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 20);

  const risksForCompany = [...acceptance.weaknesses];
  if (profile.catalogGaps.length > 0) {
    risksForCompany.push(
      `Catalog gaps (${profile.catalogGaps.join("; ")}) — verify all details in the official solicitation before committing bid resources.`,
    );
  }

  const fullBrief = [whyApply, likelihoodNarrative, applicationGuidance, teamingAndEligibility]
    .filter(Boolean)
    .join("\n\n");

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
