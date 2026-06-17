const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "with", "is", "are",
  "our", "we", "your", "as", "at", "by", "from", "be", "this", "that", "it", "not",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function overlapScore(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let overlap = 0;
  tokensA.forEach((t) => {
    if (tokensB.has(t)) overlap++;
  });

  return overlap / Math.sqrt(tokensA.size * tokensB.size);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const prev = Array.from({ length: n + 1 }, (_, j) => j);
  const curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }

  return prev[n];
}

function similarityRatio(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

function tokenFuzzyMatch(queryToken: string, corpusToken: string): number {
  if (queryToken === corpusToken) return 1;

  const shorter = queryToken.length <= corpusToken.length ? queryToken : corpusToken;
  const longer = queryToken.length > corpusToken.length ? queryToken : corpusToken;

  if (shorter.length >= 3 && longer.startsWith(shorter)) {
    return 0.85 + 0.15 * (shorter.length / longer.length);
  }

  if (shorter.length >= 3 && longer.includes(shorter)) {
    return 0.75 + 0.15 * (shorter.length / longer.length);
  }

  if (queryToken.length >= 4 && corpusToken.length >= 4) {
    const sim = similarityRatio(queryToken, corpusToken);
    if (sim >= 0.8) return sim * 0.9;
    if (sim >= 0.7) return sim * 0.75;
  }

  return 0;
}

/** Fuzzy relevance between a search query and a text corpus (0–1). */
export function fuzzyScore(query: string, corpus: string): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const corpusTokens = tokenize(corpus);
  const corpusLower = corpus.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery.length >= 4 && corpusLower.includes(normalizedQuery)) {
    return Math.min(1, 0.85 + 0.15 / queryTokens.length);
  }

  let totalMatch = 0;
  for (const qt of queryTokens) {
    let best = 0;
    if (corpusLower.includes(qt)) best = 0.92;
    for (const ct of corpusTokens) {
      best = Math.max(best, tokenFuzzyMatch(qt, ct));
    }
    totalMatch += best;
  }

  const avgMatch = totalMatch / queryTokens.length;
  if (avgMatch === 0) return 0;

  const sizeFactor = Math.sqrt(queryTokens.length / Math.max(corpusTokens.length, queryTokens.length));
  return avgMatch * (0.85 + 0.15 * sizeFactor);
}

export function containsAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((n) => n && lower.includes(n.toLowerCase()));
}
