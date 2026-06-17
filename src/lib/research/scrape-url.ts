import type { ScrapedContent } from "@/lib/domain/types";

const MAX_PAGE_CHARS = 12_000;
const FETCH_TIMEOUT_MS = 15_000;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPageText(url: string): Promise<{ title: string; text: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "SolicitationsMatcher/1.0 (research; +https://github.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? url;
    const text = stripHtml(html).slice(0, MAX_PAGE_CHARS);

    return { title, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function searchSupplementalSources(
  query: string,
): Promise<ScrapedContent["supplementalSources"]> {
  // Framework hook: plug in a search API later if needed.
  void query;
  return [];
}

export async function scrapeSolicitationSources(
  solicitationUrl: string,
  searchQuery: string,
): Promise<ScrapedContent> {
  let solicitationPageText = "";
  const supplementalSources: ScrapedContent["supplementalSources"] = [];

  if (solicitationUrl) {
    try {
      const page = await fetchPageText(solicitationUrl);
      solicitationPageText = `Title: ${page.title}\n\n${page.text}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fetch failed";
      solicitationPageText = `Could not scrape solicitation URL (${message}). Analysis will rely on sheet data.`;
    }
  } else {
    solicitationPageText = "No solicitation URL provided in sheet.";
  }

  try {
    const supplemental = await searchSupplementalSources(searchQuery);
    supplementalSources.push(...supplemental);
  } catch {
    // Non-fatal for framework
  }

  return {
    solicitationUrl,
    solicitationPageText,
    supplementalSources,
    scrapedAt: new Date().toISOString(),
  };
}
