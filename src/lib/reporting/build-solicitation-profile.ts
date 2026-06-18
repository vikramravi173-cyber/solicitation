import type { ScrapedContent } from "@/lib/domain/types";
import { extractScrapedInsights } from "@/lib/research/extract-scraped-insights";
import { resolveDisplayTitle } from "@/lib/solicitations/display-title";
import type { SolicitationRow } from "@/lib/solicitations/types";
import { COMPANIES } from "@/lib/solicitations/constants";
import { callClaude } from "@/lib/ai/call-claude";
import { synthesizeSentences } from "./synthesize-text";

export interface SolicitationProfile {
  rowIndex: number;
  displayTitle: string;
  catalogTitle: string;
  department: string;
  solicitationNumber: string;
  organization: string;
  solicitationType: string;
  dueDate: string;
  link: string;
  keyWords: string;
  applicants: string;
  whoCanSubmit: string;
  summary: string;
  funding: string;
  requirements: string;
  evaluationCriteria: string;
  portfolioFlags: string[];
  catalogGaps: string[];
  sourcesUsed: string[];
  synthesizedOverview: string;
}

const PLACEHOLDER = new Set(["tbd", "tba", "n/a", "?", "not found", ""]);

function isMeaningful(value: string): boolean {
  return !PLACEHOLDER.has(value.trim().toLowerCase());
}

function joinParagraphs(parts: string[]): string {
  return parts.filter(Boolean).join("\n\n");
}

function typeBasedRequirements(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("sbir")) {
    return "SBIR Phase I proposals typically require a technical volume, cost proposal, and company commercialization plan. Verify current page limits, formatting, and submission portal in the official solicitation package. Small business eligibility, ownership, and principal investigator rules apply.";
  }
  if (lower.includes("sttr")) {
    return "STTR proposals require a qualifying research institution partner and follow agency-specific technical and cost volumes. Confirm the research institution role and PI affiliation rules before drafting.";
  }
  if (lower.includes("baa")) {
    return "Broad Agency Announcements often accept white papers first, with full proposals invited based on review. Map your technical approach to the BAA stated thrust areas and any classified/unclassified submission paths.";
  }
  if (lower.includes("prize") || lower.includes("challenge")) {
    return "Prize and challenge competitions may have staged submissions (registration, concept, prototype, final demo). Review eligibility, IP terms, and whether government funding during the competition affects prize eligibility.";
  }
  return "";
}

function typeBasedEvaluation(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("sbir") || lower.includes("sttr")) {
    return "SBIR/STTR evaluations typically weight technical merit, team qualifications, and commercialization potential. Agency-specific scoring rubrics are published in the solicitation — use them to structure your technical narrative.";
  }
  if (lower.includes("baa")) {
    return "BAA evaluations emphasize mission relevance, technical approach, team qualifications, and transition potential. White papers are often scored for invitation to full proposal — lead with warfighter impact and feasibility.";
  }
  return "";
}

function applicantNarrative(solicitation: SolicitationRow): string {
  const parts: string[] = [];
  if (isMeaningful(solicitation.applicants)) {
    parts.push(`Catalog lists eligible applicants as: ${solicitation.applicants}.`);
  }
  const type = solicitation.solicitationType.toLowerCase();
  if (type.includes("sbir") || type.includes("sttr")) {
    parts.push("U.S. small businesses meeting SBA size standards are the primary eligible entity. Universities participate as partners on STTR, not as prime on SBIR.");
  } else if (solicitation.applicants.toLowerCase().includes("industry")) {
    parts.push("Industry organizations may compete directly or as subcontractors depending on whether the opportunity requires a government sponsor or prime contractor.");
  } else if (solicitation.applicants.toLowerCase().includes("govt")) {
    parts.push("Government personnel or federal entities are the intended submitters. Industry should pursue a government or military sponsor to participate.");
  }
  if (parts.length === 0) {
    parts.push("Applicant eligibility is not fully specified in the catalog. Download the official solicitation to confirm whether your organization can submit as prime or must team.");
  }
  return parts.join(" ");
}

function buildCatalogSummary(solicitation: SolicitationRow): string {
  const paragraphs: string[] = [];
  const displayTitle = resolveDisplayTitle(solicitation);
  paragraphs.push(`${displayTitle} is listed under ${solicitation.department} in the Gov Events & Opportunities catalog.`);
  if (isMeaningful(solicitation.organization)) {
    paragraphs.push(`Issuing or sponsoring organization: ${solicitation.organization}.`);
  }
  if (isMeaningful(solicitation.solicitationType)) {
    paragraphs.push(`Solicitation type: ${solicitation.solicitationType}. This shapes the contracting instrument, evaluation path, and typical proposal structure.`);
  }
  if (isMeaningful(solicitation.keyWords)) {
    paragraphs.push(`Catalog keywords / focus areas: ${solicitation.keyWords}.`);
  }
  if (isMeaningful(solicitation.description)) {
    paragraphs.push(`Catalog description: ${solicitation.description}`);
  } else if (!isMeaningful(solicitation.keyWords)) {
    paragraphs.push("The catalog does not include a free-text description for this entry. Use the official link or agency release to obtain the full scope and technical objectives.");
  }
  if (isMeaningful(solicitation.dueDate)) {
    paragraphs.push(`Listed due date: ${solicitation.dueDate}. Confirm whether this is a hard deadline or a rolling/open submission window.`);
  }
  return paragraphs.join("\n\n");
}

function buildFundingSection(
  solicitation: SolicitationRow,
  insights: ReturnType<typeof extractScrapedInsights>,
): string {
  if (insights.fundingSnippets.length > 0) {
    return synthesizeSentences(["Official solicitation materials indicate the following on funding:", ...insights.fundingSnippets]);
  }
  const type = solicitation.solicitationType.toLowerCase();
  if (type.includes("sbir phase i")) return "Typical SBIR Phase I awards run $150,000 to $275,000 over 6 to 12 months depending on agency; confirm the exact ceiling in the topic solicitation.";
  if (type.includes("sbir phase ii")) return "SBIR Phase II awards are commonly $1M or more over roughly 24 months; verify agency-specific caps and any Phase I to Phase II transition rules.";
  return "Award size and period of performance are not listed in the catalog; obtain the official package for funding levels and any cost-share or matching requirements.";
}

function buildRequirementsSection(
  solicitation: SolicitationRow,
  insights: ReturnType<typeof extractScrapedInsights>,
): string {
  const parts: string[] = [];
  if (insights.requirementSnippets.length > 0) parts.push(...insights.requirementSnippets);
  const typeDefault = typeBasedRequirements(solicitation.solicitationType);
  if (typeDefault) parts.push(typeDefault);
  if (parts.length === 0) return "Submission requirements are not available in the catalog; download the full RFP, BAA, or topic package for volumes, page limits, and portal instructions.";
  return synthesizeSentences(parts);
}

function buildEvaluationSection(
  solicitation: SolicitationRow,
  insights: ReturnType<typeof extractScrapedInsights>,
): string {
  const parts: string[] = [];
  if (insights.evaluationSnippets.length > 0) parts.push(...insights.evaluationSnippets);
  const typeDefault = typeBasedEvaluation(solicitation.solicitationType);
  if (typeDefault) parts.push(typeDefault);
  if (parts.length === 0) return "Evaluation criteria are not listed in the catalog; build a compliance matrix from the official solicitation before drafting.";
  return synthesizeSentences(parts);
}

function identifyCatalogGaps(solicitation: SolicitationRow): string[] {
  const gaps: string[] = [];
  if (!isMeaningful(solicitation.title)) gaps.push("Missing solicitation title in catalog");
  if (!solicitation.link) gaps.push("No official link in catalog");
  if (!isMeaningful(solicitation.description)) gaps.push("No description in catalog");
  if (!isMeaningful(solicitation.dueDate)) gaps.push("Due date not listed");
  if (!isMeaningful(solicitation.solicitationType)) gaps.push("Solicitation type not specified");
  return gaps;
}

const OVERVIEW_SYSTEM = `You are a federal grants analyst writing opportunity summaries for a government affairs consultancy.
Rules:
- Write in plain, direct prose.
- Do not repeat the opportunity title more than once.
- Do not use transition filler phrases like "On eligibility," or "Regarding funding," — just state the information directly.
- Do not restate input data verbatim — synthesize it.
- Maximum 4 sentences.
- No em dashes.`;

function factualOverviewFallback(profile: SolicitationProfile): string {
  const parts = [
    `${profile.displayTitle} is a ${profile.department} solicitation`,
    profile.organization ? ` from ${profile.organization}` : "",
    profile.dueDate ? ` with a listed deadline of ${profile.dueDate}.` : ".",
    profile.catalogGaps.length > 0
      ? ` Some catalog fields are incomplete (${profile.catalogGaps.join(", ")}); confirm details in the official solicitation.`
      : "",
  ];
  return parts.filter(Boolean).join("");
}

async function synthesizeSolicitationOverview(profile: SolicitationProfile): Promise<string> {
  const hasContent =
    profile.keyWords || profile.funding || profile.requirements || profile.evaluationCriteria;

  if (!hasContent) {
    return factualOverviewFallback(profile);
  }

  const overview = await callClaude({
    system: OVERVIEW_SYSTEM,
    prompt: `Write a 3-4 sentence overview of this federal opportunity for a company evaluating whether to pursue it.

Title: ${profile.displayTitle}
Agency: ${profile.department}${profile.organization ? ` / ${profile.organization}` : ""}
Type: ${profile.solicitationType || "Not specified"}
Due: ${profile.dueDate || "Not listed"}
Focus areas: ${profile.keyWords || "Not listed"}
Funding: ${profile.funding}
Eligibility: ${profile.whoCanSubmit}
Submission requirements: ${profile.requirements}
Evaluation criteria: ${profile.evaluationCriteria}
Catalog gaps: ${profile.catalogGaps.length > 0 ? profile.catalogGaps.join(", ") : "None"}

Cover what it is, who can apply, what the funding looks like, and any important caveats. Do not start with the title.`,
  });

  return overview || factualOverviewFallback(profile);
}

export async function buildSolicitationProfile(
  solicitation: SolicitationRow,
  research?: ScrapedContent,
): Promise<SolicitationProfile> {
  const scrapedText = research?.solicitationPageText ?? "";
  const hasScrape =
    scrapedText &&
    !scrapedText.startsWith("Could not scrape") &&
    !scrapedText.startsWith("No solicitation");
  const insights = hasScrape
    ? extractScrapedInsights(scrapedText)
    : extractScrapedInsights("");

  const displayTitle = resolveDisplayTitle(
    solicitation,
    hasScrape ? insights.pageTitle : undefined,
  );

  const portfolioFlags = COMPANIES.filter((c) => solicitation.companyFlags[c]);

  const summaryParts = [buildCatalogSummary(solicitation)];
  if (insights.summarySnippets.length > 0) {
    summaryParts.push(synthesizeSentences(insights.summarySnippets));
  }
  if (insights.deadlineSnippets.length > 0) {
    summaryParts.push(synthesizeSentences(insights.deadlineSnippets));
  }

  let whoCanSubmit = applicantNarrative(solicitation);
  if (insights.eligibilitySnippets.length > 0) {
    whoCanSubmit = synthesizeSentences([whoCanSubmit, ...insights.eligibilitySnippets]);
  }

  const sourcesUsed = [
    ...(solicitation.link ? [solicitation.link] : []),
    ...(research?.supplementalSources.map((s) => s.url) ?? []),
  ];
  const uniqueSources = [...new Set(sourcesUsed.filter(Boolean))];

  const profile: SolicitationProfile = {
    rowIndex: solicitation.rowIndex,
    displayTitle,
    catalogTitle: solicitation.title,
    department: solicitation.department,
    solicitationNumber: solicitation.solicitationNumber,
    organization: solicitation.organization,
    solicitationType: solicitation.solicitationType,
    dueDate: solicitation.dueDate,
    link: solicitation.link,
    keyWords: solicitation.keyWords,
    applicants: solicitation.applicants,
    whoCanSubmit,
    summary: joinParagraphs(summaryParts),
    funding: buildFundingSection(solicitation, insights),
    requirements: buildRequirementsSection(solicitation, insights),
    evaluationCriteria: buildEvaluationSection(solicitation, insights),
    portfolioFlags,
    catalogGaps: identifyCatalogGaps(solicitation),
    sourcesUsed: uniqueSources,
    synthesizedOverview: "",
  };

  profile.synthesizedOverview = await synthesizeSolicitationOverview(profile);
  return profile;
}

export function buildSolicitationProfilePool(
  solicitations: SolicitationRow[],
): Map<number, Promise<SolicitationProfile>> {
  const pool = new Map<number, Promise<SolicitationProfile>>();
  for (const solicitation of solicitations) {
    pool.set(solicitation.rowIndex, buildSolicitationProfile(solicitation));
  }
  return pool;
}
