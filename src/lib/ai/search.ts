import Anthropic from "@anthropic-ai/sdk";
import type { SearchResult, SolicitationRow } from "@/lib/solicitations/types";

const MODEL = "claude-sonnet-4-6";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  return new Anthropic({ apiKey });
}

function buildPrompt(rows: SolicitationRow[], query: string): string {
  return `You are a federal solicitations search assistant.

Given the solicitations dataset below and the user's search query, return the top matching solicitations as a JSON array.

Each result object must include exactly these fields:
- title (string)
- department (string)
- dueDate (string)
- org (string) — from the Organization column
- type (string) — from the Solicitation Type column
- descriptionSnippet (string) — at most 200 characters from the Description
- link (string)
- companyFlags (object) — only include company keys that are marked true. Valid keys: "Optical Gate", "OTEC", "Ingenium", "Swift Solar", "OMC Thermochemistry", "MXene Inc"

Return between 1 and 15 results, ranked by relevance. If nothing matches well, return an empty array [].

Respond with valid JSON only — no markdown fences, no commentary.

User query:
${query}

Solicitations data (JSON):
${JSON.stringify(rows)}`;
}

function parseSearchResults(text: string): SearchResult[] {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;

  const parsed = JSON.parse(jsonText) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Anthropic response was not a JSON array");
  }

  return parsed as SearchResult[];
}

export async function searchSolicitationsWithAI(
  rows: SolicitationRow[],
  query: string,
): Promise<SearchResult[]> {
  if (rows.length === 0) {
    return [];
  }

  const client = getClient();
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildPrompt(rows, query),
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic returned no text content");
  }

  return parseSearchResults(textBlock.text);
}

export function filterOnlyResults(rows: SolicitationRow[]): SearchResult[] {
  return rows.map((row) => ({
    title: row.title,
    department: row.department,
    dueDate: row.dueDate,
    org: row.organization,
    type: row.solicitationType,
    descriptionSnippet: row.description.slice(0, 200),
    link: row.link,
    companyFlags: Object.fromEntries(
      Object.entries(row.companyFlags).filter(([, flagged]) => flagged),
    ),
  }));
}
