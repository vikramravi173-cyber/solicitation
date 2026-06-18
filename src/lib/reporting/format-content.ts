/** Format report sections as scannable bullet lists instead of prose walls. */

const BULLET_PREFIX = /^[\s•\-–—*]+/;
const LABEL_PREFIX = /^(scope|focus|funding|eligibility|type|due date|issuing org|instrument|to apply|evaluation|from official materials):\s*/i;

export function cleanBullet(text: string): string {
  return text.replace(BULLET_PREFIX, "").replace(/\s+/g, " ").trim();
}

export function ensurePeriod(text: string): string {
  const t = text.trim();
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Truncate a single bullet to a readable length. */
export function truncateBullet(text: string, maxLen = 200): string {
  const t = cleanBullet(text);
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed}…`;
}

/** Pull the first N meaningful sentences from a block of text. */
export function condenseText(text: string, maxSentences = 2, maxChars = 280): string {
  if (!text.trim()) return "";
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => cleanBullet(s))
    .filter((s) => s.length >= 15);
  const picked = sentences.slice(0, maxSentences).join(" ");
  return truncateBullet(picked || text, maxChars);
}

function normalizeForDedup(text: string): string {
  return cleanBullet(text)
    .toLowerCase()
    .replace(LABEL_PREFIX, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Dedupe bullets, dropping items that repeat known facts or other bullets. */
export function semanticDedupeBullets(
  items: string[],
  knownFacts: string[] = [],
): string[] {
  const knownNorms = knownFacts.map(normalizeForDedup).filter((k) => k.length > 3);
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const raw of items) {
    const bullet = cleanBullet(raw);
    if (!bullet || bullet.length < 8) continue;

    const norm = normalizeForDedup(bullet);
    if (!norm || seen.has(norm)) continue;

    // Skip if mostly repeating facts already shown elsewhere in the UI
    const knownHits = knownNorms.filter(
      (k) => norm.includes(k) || k.includes(norm.slice(0, Math.min(norm.length, 40))),
    );
    if (knownHits.length >= 2 || (knownHits.length === 1 && norm.length < 60)) continue;

    // Skip if this bullet is contained in or contains an existing bullet
    if (unique.some((u) => {
      const uNorm = normalizeForDedup(u);
      return uNorm.includes(norm) || norm.includes(uNorm);
    })) continue;

    // Skip generic boilerplate
    if (
      /catalog entry|issuing org:|instrument:|due date:|eligible applicants:/i.test(bullet) ||
      /typically require|typically weight|page limits, formatting|confirm naics/i.test(bullet) ||
      /verify in official|confirm details before committing|download the official/i.test(bullet) ||
      /build a compliance matrix/i.test(bullet)
    ) continue;

    seen.add(norm);
    unique.push(bullet);
  }

  return unique;
}

/** Dedupe and clean a list of bullet items. */
export function dedupeBullets(items: string[]): string[] {
  return semanticDedupeBullets(items);
}

/** Format items as a newline-delimited bullet list for storage. */
export function toBulletList(items: string[]): string {
  return dedupeBullets(items)
    .map((item) => `• ${truncateBullet(item)}`)
    .join("\n");
}

/** Parse stored bullet-list text back into items. */
export function parseBulletList(text: string): string[] {
  if (!text.trim()) return [];

  const lines = text.split(/\n+/).map(cleanBullet).filter(Boolean);
  if (lines.length > 1) return lines;

  const single = lines[0] ?? "";
  if (single.length > 300) {
    return single
      .split(/(?<=[.!?])\s+/)
      .map(cleanBullet)
      .filter((s) => s.length >= 15)
      .slice(0, 5);
  }

  return lines;
}

/** True when text is formatted as a multi-line bullet list. */
export function isBulletList(text: string): boolean {
  return /^•\s/m.test(text) || text.split(/\n+/).filter(Boolean).length > 1;
}

/** Facts already rendered in the dossier header / snapshot grid. */
export function profileKnownFacts(profile: {
  displayTitle?: string;
  department?: string;
  organization?: string;
  dueDate?: string;
  solicitationType?: string;
  applicants?: string;
  solicitationNumber?: string;
  keyWords?: string;
}): string[] {
  return [
    profile.displayTitle,
    profile.department,
    profile.organization,
    profile.dueDate,
    profile.solicitationType,
    profile.applicants,
    profile.solicitationNumber,
    profile.keyWords,
  ].filter((v): v is string => Boolean(v?.trim()));
}
