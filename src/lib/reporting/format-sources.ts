export interface FormattedSource {
  label: string;
  href?: string;
}

const URL_RE = /^https?:\/\//i;

/** Links only — no catalog or other non-URL source labels. */
export function formatReportSources(
  sources: string[],
  officialLink?: string,
): FormattedSource[] {
  const seenUrls = new Set<string>();
  const result: FormattedSource[] = [];

  function addUrl(url: string, label: string) {
    const normalized = url.trim();
    if (!URL_RE.test(normalized) || seenUrls.has(normalized)) return;
    seenUrls.add(normalized);
    result.push({ label, href: normalized });
  }

  if (officialLink?.trim() && URL_RE.test(officialLink.trim())) {
    addUrl(officialLink.trim(), "Official solicitation");
  }

  for (const source of sources) {
    const s = source.trim();
    if (s && URL_RE.test(s)) {
      const label =
        officialLink && s === officialLink.trim() ? "Official solicitation" : linkLabel(s);
      addUrl(s, label);
    }
  }

  return result;
}

function linkLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || "Reference link";
  } catch {
    return "Reference link";
  }
}

/** Drop URL strings and near-duplicate review instructions from application bullets. */
export function filterApplicationActions(actions: string[]): string[] {
  const seen = new Set<string>();
  return actions
    .map((a) => a.trim())
    .filter((a) => {
      if (!a || URL_RE.test(a)) return false;
      if (/review full solicitation at/i.test(a)) return false;
      if (/confirm solicitation url/i.test(a)) return false;
      const key = a.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
