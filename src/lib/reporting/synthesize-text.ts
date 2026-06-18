/** Turns bullet lists and fragmented snippets into readable prose (legacy) or bullet lists (preferred). */

import {
  cleanBullet,
  dedupeBullets,
  ensurePeriod,
  toBulletList,
  truncateBullet,
} from "./format-content";

export { cleanBullet, dedupeBullets, ensurePeriod, toBulletList, truncateBullet };

/** Merge sentences into flowing paragraphs, dropping near-duplicates. Prefer toBulletList for reports. */
export function synthesizeSentences(sentences: string[]): string {
  const unique = dedupeBullets(sentences).map(ensurePeriod);
  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0];
  return unique.join(" ");
}

/** Build a scannable bullet list from sentence fragments — preferred for report sections. */
export function synthesizeBullets(sentences: string[]): string {
  return toBulletList(sentences);
}

/** Weave labeled content blocks into a single narrative with light section breaks. */
export function synthesizeSections(
  sections: Array<{ label?: string; body: string }>,
): string {
  const paragraphs: string[] = [];

  for (const { label, body } of sections) {
    const prose = synthesizeSentences(body.split(/\n+/).flatMap((line) => line.split(/(?<=[.!?])\s+/)));
    if (!prose) continue;
    paragraphs.push(label ? `${label} ${prose}` : prose);
  }

  return paragraphs.join("\n\n");
}

/** Build multi-paragraph narrative from sections, using transitions between topics. */
export function synthesizeNarrative(
  paragraphs: string[],
  transitions?: string[],
): string {
  const cleaned = paragraphs.map((p) => p.trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];

  const result: string[] = [cleaned[0]];
  for (let i = 1; i < cleaned.length; i++) {
    const transition = transitions?.[i - 1];
    result.push(transition ? `${transition} ${cleaned[i]}` : cleaned[i]);
  }
  return result.join("\n\n");
}

/** Convert talking points into a bullet list — one actionable item per line. */
export function synthesizeTalkingPoints(points: string[]): string {
  const cleaned = points
    .map((p) => p.replace(/^Action:\s*/i, "").trim())
    .filter(Boolean);

  return toBulletList(cleaned);
}
