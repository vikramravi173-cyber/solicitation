/** Turns bullet lists and fragmented snippets into readable prose. */

function cleanBullet(text: string): string {
  return text.replace(/^[\s•\-–—]+/, "").replace(/\s+/g, " ").trim();
}

function ensurePeriod(text: string): string {
  const t = text.trim();
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Merge sentences into flowing paragraphs, dropping near-duplicates. */
export function synthesizeSentences(sentences: string[]): string {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const raw of sentences) {
    const sentence = ensurePeriod(cleanBullet(raw));
    if (!sentence || sentence.length < 12) continue;
    const key = sentence.toLowerCase().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(sentence);
  }

  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0];

  return unique.join(" ");
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

/** Convert an array of talking points into a cohesive guidance paragraph. */
export function synthesizeTalkingPoints(points: string[]): string {
  const cleaned = points
    .map((p) => p.replace(/^Action:\s*/i, "").trim())
    .filter(Boolean);

  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return ensurePeriod(cleaned[0]);

  const intro = ensurePeriod(cleaned[0]);
  const rest = cleaned.slice(1).map((p, i) => {
    const s = ensurePeriod(p);
    if (i === 0) return `Also emphasize that ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
    return s;
  });

  return [intro, ...rest].join(" ");
}
