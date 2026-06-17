import type { CompanyProfile } from "@/lib/company/questionnaire";

/** Short label for personalization when no company name is collected. */
export function companyDisplayLabel(company: CompanyProfile): string {
  const fromContext = company.additionalContext.trim().split(/[.,\n]/)[0]?.trim();
  if (fromContext && fromContext.length >= 3 && fromContext.length <= 40) {
    return fromContext;
  }

  const fromCapabilities = company.technologyAndCapabilities.trim().split(/[.,\n]/)[0]?.trim();
  if (fromCapabilities && fromCapabilities.length >= 3 && fromCapabilities.length <= 50) {
    return fromCapabilities;
  }

  return "your company";
}

/** Split prose into bullet items for report sections. */
export function toBulletList(text: string): string[] {
  if (!text.trim()) return [];

  const byLine = text
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•\-–—\d.)]+/, "").trim())
    .filter((line) => line.length > 12);

  if (byLine.length > 1) return byLine;

  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20);
}

/** Extract percentage-weighted evaluation lines when present in scraped or catalog text. */
export function extractEvaluationBullets(text: string): string[] {
  const weighted = Array.from(text.matchAll(/([^.\n]+?:\s*\d+\s*%)/gi)).map((m) => m[1].trim());
  if (weighted.length > 0) return weighted;

  return toBulletList(text);
}

export function personalizeWhoCanSubmit(
  whoCanSubmit: string,
  teamingNotes: string,
  companyLabel: string,
): string {
  const base = whoCanSubmit.trim();
  const notes = teamingNotes.trim();
  const source = notes.length > base.length ? notes : base;

  return source.replace(/\byour (company|firm)\b/gi, companyLabel);
}

export function personalizeSummary(
  profileSummary: string,
  whyApply: string,
  companyLabel: string,
): string {
  const fit = whyApply.trim();
  const overview = profileSummary.trim();

  if (!overview) return fit.replace(/\byour (company|firm)\b/gi, companyLabel);

  const personalizedFit = fit.replace(/\byour (company|firm)\b/gi, companyLabel);
  return `${personalizedFit}\n\n${overview}`;
}

export function personalizeEvaluationCriteria(
  criteria: string,
  companyLabel: string,
  capabilities: string,
): string {
  const bullets = extractEvaluationBullets(criteria);
  const capabilityHint = capabilities.trim().slice(0, 120);

  if (bullets.length === 0) {
    return criteria.replace(/\byour (company|firm)\b/gi, companyLabel);
  }

  const intro = `Evaluation criteria (most relevant for ${companyLabel}${capabilityHint ? `, given your focus on ${capabilityHint}` : ""}):`;
  return `${intro}\n${bullets.map((b) => `• ${b}`).join("\n")}`;
}
