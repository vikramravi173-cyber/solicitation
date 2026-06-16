import { askClaudeJson } from "@/lib/ai/client";
import type { CompanyProfile } from "@/lib/company/questionnaire";
import type { AcceptanceAssessment, OpportunitySummary } from "@/lib/domain/types";
import type { SolicitationRow } from "@/lib/solicitations/types";

export async function scoreAcceptanceLikelihood(
  company: CompanyProfile,
  solicitation: SolicitationRow,
  summary: OpportunitySummary,
): Promise<AcceptanceAssessment> {
  const prompt = `You are a federal proposal evaluator.

Estimate the company's likelihood of winning or being selected for this solicitation.

Respond with valid JSON only:
{
  "likelihoodScore": <0-100>,
  "likelihoodLabel": "Low" | "Moderate" | "High" | "Very High",
  "rationale": string,
  "strengths": string[],
  "weaknesses": string[],
  "recommendedActions": string[]
}

Be realistic. Factor in TRL fit, past performance, team size, solicitation type, competition, and gaps.

Company:
${JSON.stringify(company, null, 2)}

Solicitation:
${JSON.stringify(solicitation, null, 2)}

Opportunity summary:
${JSON.stringify(summary, null, 2)}`;

  return askClaudeJson<AcceptanceAssessment>(prompt);
}
