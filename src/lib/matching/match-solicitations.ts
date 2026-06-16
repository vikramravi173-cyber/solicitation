import { askClaudeJson } from "@/lib/ai/client";
import type { CompanyProfile } from "@/lib/company/questionnaire";
import type { MatchedSolicitation } from "@/lib/domain/types";
import type { SolicitationRow } from "@/lib/solicitations/types";

const TOP_MATCH_COUNT = 5;

interface MatchResponse {
  matches: Array<{
    rowIndex: number;
    matchScore: number;
    matchRationale: string;
  }>;
}

export async function matchSolicitations(
  company: CompanyProfile,
  solicitations: SolicitationRow[],
): Promise<MatchedSolicitation[]> {
  if (solicitations.length === 0) return [];

  const prompt = `You are a federal business development analyst.

Given the company profile and solicitations database, return the top ${TOP_MATCH_COUNT} best-matching solicitations.

Score each match from 0-100. Consider technology fit, department alignment, solicitation type fit, TRL alignment, keywords, and company flags when relevant.

Respond with valid JSON only:
{
  "matches": [
    {
      "rowIndex": <number from solicitation.rowIndex>,
      "matchScore": <0-100>,
      "matchRationale": "<2-3 sentences>"
    }
  ]
}

Company profile:
${JSON.stringify(company, null, 2)}

Solicitations:
${JSON.stringify(solicitations, null, 2)}`;

  const response = await askClaudeJson<MatchResponse>(prompt);
  const byRowIndex = new Map(solicitations.map((s) => [s.rowIndex, s]));

  return response.matches
    .map((match) => {
      const solicitation = byRowIndex.get(match.rowIndex);
      if (!solicitation) return null;
      return {
        solicitation,
        matchScore: match.matchScore,
        matchRationale: match.matchRationale,
      };
    })
    .filter((m): m is MatchedSolicitation => m !== null)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, TOP_MATCH_COUNT);
}
