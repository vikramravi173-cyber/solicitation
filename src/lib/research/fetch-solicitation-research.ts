import type { ScrapedContent } from "@/lib/domain/types";
import { resolveDisplayTitle } from "@/lib/solicitations/display-title";
import type { SolicitationRow } from "@/lib/solicitations/types";

const FETCH_TIMEOUT_MS = 12_000;

function htmlToText(html: string): string {
  if (typeof DOMParser === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, nav, footer, header").forEach((el) => el.remove());
  return (doc.body?.innerText ?? "").replace(/\s+/g, " ").trim();
}

function extractPageTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

/** Pull structured lines from grants.gov / simpler.grants.gov page text. */
function enrichGrantsPageText(raw: string): string {
  const lines: string[] = [];
  const award = raw.match(/\$[\d,]+(?:\.\d+)?/g);
  if (award?.length) lines.push(`Award funding: ${[...new Set(award)].slice(0, 3).join(" – ")}.`);
  const closing = raw.match(/Closing:\s*([A-Za-z]+\s+\d{1,2},\s*\d{4})/i);
  if (closing) lines.push(`Closing date: ${closing[1]}.`);
  const fon = raw.match(/Funding opportunity number:\s*([A-Z0-9-]+)/i);
  if (fon) lines.push(`Funding opportunity number: ${fon[1]}.`);
  const instrument = raw.match(/Funding instrument type:\s*([^.]+)/i);
  if (instrument) lines.push(`Instrument: ${instrument[1].trim()}.`);
  const category = raw.match(/Category of Funding Activity:\s*([^.]+)/i);
  if (category) lines.push(`Funding category: ${category[1].trim()}.`);
  const contact = raw.match(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i);
  if (contact) lines.push(`Grantor contact: ${contact[1]}.`);
  return lines.join("\n");
}

function buildCatalogResearchText(solicitation: SolicitationRow): string {
  const title = resolveDisplayTitle(solicitation);
  const parts = [`Title: ${title}`, ""];

  if (solicitation.description?.trim()) {
    parts.push(solicitation.description.trim());
  }
  if (solicitation.applicants?.trim()) {
    parts.push(`\nEligible applicants: ${solicitation.applicants.trim()}`);
  }
  if (solicitation.organization?.trim()) {
    parts.push(`Issuing organization: ${solicitation.organization.trim()}`);
  }
  if (solicitation.solicitationType?.trim()) {
    parts.push(`Solicitation type: ${solicitation.solicitationType.trim()}`);
  }
  if (solicitation.dueDate?.trim()) {
    parts.push(`Due date: ${solicitation.dueDate.trim()}`);
  }
  if (solicitation.solicitationNumber?.trim()) {
    parts.push(`Solicitation number: ${solicitation.solicitationNumber.trim()}`);
  }
  if (solicitation.keyWords?.trim()) {
    parts.push(`Focus areas: ${solicitation.keyWords.trim()}`);
  }

  return parts.join("\n");
}

async function fetchPageText(url: string): Promise<{ title: string; text: string; excerpt: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    if (!response.ok) return null;

    const html = await response.text();
    const title = extractPageTitle(html) || url;
    let text = htmlToText(html);
    if (url.includes("grants.gov")) {
      text = `${text}\n\n${enrichGrantsPageText(text)}`;
    }
    const excerpt = text.slice(0, 400).trim();
    return { title, text: `Title: ${title}\n\n${text}`, excerpt };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Catalog fields plus optional live page fetch for richer dossier content. */
export async function fetchSolicitationResearch(
  solicitation: SolicitationRow,
): Promise<ScrapedContent> {
  const catalogText = buildCatalogResearchText(solicitation);
  const supplemental: ScrapedContent["supplementalSources"] = [];

  let pageText = catalogText;

  if (solicitation.link?.startsWith("http")) {
    const live = await fetchPageText(solicitation.link);
    if (live) {
      pageText = `${live.text}\n\n--- Catalog reference ---\n${catalogText}`;
      supplemental.push({
        url: solicitation.link,
        title: live.title,
        excerpt: live.excerpt,
      });
    }
  }

  return {
    solicitationUrl: solicitation.link ?? "",
    solicitationPageText: pageText,
    supplementalSources: supplemental,
    scrapedAt: new Date().toISOString(),
  };
}
