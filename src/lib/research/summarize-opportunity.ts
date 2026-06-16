import { askClaudeJson } from "@/lib/ai/client";
import type { CompanyProfile } from "@/lib/company/questionnaire";
import type { OpportunitySummary, ScrapedContent } from "@/lib/domain/types";
import type { SolicitationRow } from "@/lib/solicitations/types";

export async function summarizeOpportunity(
  company: CompanyProfile,
  solicitation: SolicitationRow,
  research: ScrapedContent,
): Promise<OpportunitySummary> {
  const prompt = `You are a federal capture strategist.

Write a one-page opportunity summary for this company and solicitation. Use the sheet data, scraped solicitation page, and any supplemental sources.

Respond with valid JSON only:
{
  "solicitationNumber": string,
  "title": string,
  "onePageSummary": string (3-5 paragraphs, executive-ready),
  "keyRequirements": string[],
  "fitHighlights": string[],
  "risksAndGaps": string[],
  "sourcesUsed": string[]
}

Company:
${JSON.stringify(company, null, 2)}

Solicitation (sheet):
${JSON.stringify(solicitation, null, 2)}

Research:
${JSON.stringify(research, null, 2)}`;

  return askClaudeJson<OpportunitySummary>(prompt, 6000);
}
