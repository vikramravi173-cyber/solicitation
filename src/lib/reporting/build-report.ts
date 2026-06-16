import { askClaudeJson } from "@/lib/ai/client";
import type { CompanyProfile } from "@/lib/company/questionnaire";
import type { AnalyzedOpportunity, FinalReport } from "@/lib/domain/types";

export async function buildFinalReport(
  company: CompanyProfile,
  opportunities: AnalyzedOpportunity[],
): Promise<FinalReport> {
  const prompt = `You are a senior BD advisor preparing a one-page decision brief.

Given the company and analyzed opportunities, produce a final report recommending which solicitations to pursue and why.

Respond with valid JSON only:
{
  "executiveSummary": string (2-3 paragraphs),
  "recommendedOpportunities": [
    {
      "rank": number,
      "title": string,
      "solicitationNumber": string,
      "department": string,
      "dueDate": string,
      "link": string,
      "likelihoodScore": number,
      "likelihoodLabel": "Low" | "Moderate" | "High" | "Very High",
      "whyRecommended": string
    }
  ],
  "overallStrategy": string,
  "generatedAt": string (ISO timestamp)
}

Rank opportunities by strategic value (fit + likelihood + timing). Include only the strongest options.

Company:
${JSON.stringify(company, null, 2)}

Analyzed opportunities:
${JSON.stringify(opportunities, null, 2)}`;

  const report = await askClaudeJson<FinalReport>(prompt, 6000);
  return {
    ...report,
    generatedAt: report.generatedAt || new Date().toISOString(),
  };
}
