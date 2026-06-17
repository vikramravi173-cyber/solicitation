import type { SolicitationRow } from "./types";

const PLACEHOLDER = new Set(["tbd", "tba", "n/a", "?", "not found", ""]);

function isMeaningful(value: string): boolean {
  return !PLACEHOLDER.has(value.trim().toLowerCase());
}

function sbirTopicLabel(link: string): string | null {
  const match = link.match(/sbir\.gov\/topics\/(\d+)/i);
  if (!match) return null;
  return `SBIR Topic ${match[1]}`;
}

/**
 * Resolves a human-readable title. Never returns an empty string.
 */
export function resolveDisplayTitle(
  solicitation: SolicitationRow,
  scrapedTitle?: string,
): string {
  if (isMeaningful(solicitation.title)) {
    return solicitation.title.trim();
  }

  if (scrapedTitle) {
    const clean = scrapedTitle
      .replace(/\s*[-|]\s*SBIR.*$/i, "")
      .replace(/\s*[-|]\s*SAM\.gov.*$/i, "")
      .trim();
    if (isMeaningful(clean) && clean.length > 8) {
      return clean;
    }
  }

  if (isMeaningful(solicitation.solicitationNumber)) {
    return solicitation.solicitationNumber.trim();
  }

  if (solicitation.link) {
    const sbir = sbirTopicLabel(solicitation.link);
    if (sbir) {
      const org = isMeaningful(solicitation.organization)
        ? ` (${solicitation.organization})`
        : "";
      return `${sbir}${org}`;
    }
  }

  const parts: string[] = [];
  if (isMeaningful(solicitation.solicitationType)) {
    parts.push(solicitation.solicitationType.trim());
  }
  if (isMeaningful(solicitation.organization)) {
    parts.push(solicitation.organization.trim());
  }
  if (parts.length > 0) {
    const due = isMeaningful(solicitation.dueDate)
      ? ` — Due ${solicitation.dueDate}`
      : "";
    return `${solicitation.department} ${parts.join(" / ")}${due}`;
  }

  if (isMeaningful(solicitation.keyWords)) {
    return `${solicitation.department}: ${solicitation.keyWords.trim()}`;
  }

  if (isMeaningful(solicitation.applicants)) {
    return `${solicitation.department} Opportunity for ${solicitation.applicants}`;
  }

  const due = isMeaningful(solicitation.dueDate)
    ? ` (Due ${solicitation.dueDate})`
    : "";
  return `${solicitation.department} Solicitation #${solicitation.rowIndex}${due}`;
}
