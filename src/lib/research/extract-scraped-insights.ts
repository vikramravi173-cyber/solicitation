export interface ScrapedInsights {
  pageTitle: string;
  fundingSnippets: string[];
  eligibilitySnippets: string[];
  requirementSnippets: string[];
  evaluationSnippets: string[];
  deadlineSnippets: string[];
  summarySnippets: string[];
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function pickSentences(text: string, patterns: RegExp[], limit = 4): string[] {
  const hits: string[] = [];
  for (const sentence of sentences(text)) {
    if (matchesAny(sentence, patterns)) {
      hits.push(sentence);
      if (hits.length >= limit) break;
    }
  }
  return hits;
}

function extractTitle(text: string): string {
  const titleMatch = text.match(/^Title:\s*(.+?)(?:\n\n|$)/i);
  return titleMatch?.[1]?.trim() ?? "";
}

export function extractScrapedInsights(scrapedText: string): ScrapedInsights {
  const body = scrapedText.replace(/^Title:\s*.+?\n\n/i, "").trim();
  const pageTitle = extractTitle(scrapedText);

  const fundingSnippets = pickSentences(body, [
    /\$[\d,]+(?:\.\d+)?\s*(?:million|m\b|k\b|thousand)?/i,
    /fund(?:ing|ed)/i,
    /award(?:s)? up to/i,
    /budget activit/i,
    /cost[- ]share/i,
    /matching fund/i,
  ]);

  const eligibilitySnippets = pickSentences(body, [
    /eligible/i,
    /who can (?:apply|submit)/i,
    /must be (?:a |an )?/i,
    /applicant/i,
    /small business/i,
    /cannot submit/i,
    /primary applicant/i,
    /teaming/i,
    /partner/i,
  ]);

  const requirementSnippets = pickSentences(body, [
    /submit(?:ted|ting)?/i,
    /proposal/i,
    /quad chart/i,
    /white paper/i,
    /stage \d/i,
    /required document/i,
    /deliverable/i,
    /format/i,
    /page limit/i,
  ]);

  const evaluationSnippets = pickSentences(body, [
    /evaluat/i,
    /\d+\s*%/,
    /criteria/i,
    /scored/i,
    /weight(?:ed|ing)?/i,
    /selection/i,
    /merit review/i,
  ]);

  const deadlineSnippets = pickSentences(body, [
    /due (?:date|by|on)/i,
    /deadline/i,
    /closes? (?:on|at)/i,
    /submission window/i,
    /proposals? due/i,
  ]);

  const summarySnippets = pickSentences(body, [
    /program/i,
    /objective/i,
    /purpose/i,
    /seek(?:s|ing)/i,
    /focus(?:es)? on/i,
    /topic area/i,
    /this (?:opportunity|solicitation|announcement)/i,
  ]).slice(0, 5);

  return {
    pageTitle,
    fundingSnippets,
    eligibilitySnippets,
    requirementSnippets,
    evaluationSnippets,
    deadlineSnippets,
    summarySnippets,
  };
}
