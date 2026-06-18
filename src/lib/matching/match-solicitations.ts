import type { CompanyProfile } from "@/lib/company/questionnaire";
import { companyProfileText, federalExperienceText } from "@/lib/company/questionnaire";
import type { MatchedSolicitation } from "@/lib/domain/types";
import type { SolicitationRow } from "@/lib/solicitations/types";
import { resolveDisplayTitle } from "@/lib/solicitations/display-title";
import { departmentMatchesTarget } from "./department-match";
import { textMatchScore, overlapScore, tokenize } from "./text-utils";

const TOP_MATCH_COUNT = 5;

function companyCorpus(company: CompanyProfile): string {
  return companyProfileText(company);
}

function solicitationCorpus(row: SolicitationRow): string {
  return [
    resolveDisplayTitle(row),
    row.title,
    row.description,
    row.keyWords,
    row.solicitationType,
    row.organization,
    row.applicants,
    row.solicitationNumber,
  ].join(" ");
}

export { solicitationCorpus as solicitationSearchCorpus };

function scoreDepartment(company: CompanyProfile, row: SolicitationRow): number {
  if (!company.targetDepartments.trim()) return 50;
  return departmentMatchesTarget(company.targetDepartments, row.department) ? 100 : 20;
}

function scoreCompanyFlag(_company: CompanyProfile, row: SolicitationRow): number {
  if (Object.values(row.companyFlags).some(Boolean)) return 55;
  return 60;
}

function scoreSolicitationType(company: CompanyProfile, row: SolicitationRow): number {
  const experience = federalExperienceText(company);
  const type = row.solicitationType.toLowerCase();
  if (!type) return 50;
  if (type.includes("sbir") && experience.includes("sbir")) return 100;
  if (type.includes("sttr") && experience.includes("sttr")) return 100;
  if (type.includes("baa") && experience.includes("baa")) return 90;
  if (type.includes("prize") && experience.includes("prize")) return 90;
  return 45;
}

function scoreTrl(company: CompanyProfile, row: SolicitationRow): number {
  const trl = company.technologyReadinessLevel;
  const text = solicitationCorpus(row).toLowerCase();
  if (trl.includes("4-6") && (text.includes("prototype") || text.includes("demonstration"))) {
    return 85;
  }
  if (trl.includes("7-9") && (text.includes("deploy") || text.includes("production"))) {
    return 85;
  }
  if (trl.includes("1-3") && (text.includes("research") || text.includes("basic"))) {
    return 80;
  }
  return 60;
}

function buildRationale(
  company: CompanyProfile,
  row: SolicitationRow,
  scores: { keyword: number; department: number; type: number },
): string {
  const parts: string[] = [];

  if (scores.department >= 80) {
    parts.push(`${row.department} aligns with your target agencies (${company.targetDepartments}).`);
  }
  if (scores.keyword >= 0.35) {
    parts.push(`Strong keyword overlap between your capabilities and this opportunity's focus areas.`);
  }
  if (scores.type >= 80) {
    parts.push(`Solicitation type (${row.solicitationType || "federal"}) matches your stated contract history.`);
  }
  if (!row.title.trim()) {
    parts.push(`Catalog entry identified as: ${resolveDisplayTitle(row)}.`);
  }
  const flagged = Object.entries(row.companyFlags)
    .filter(([, v]) => v)
    .map(([k]) => k);
  if (flagged.length > 0) {
    parts.push(`Catalog flags this opportunity for: ${flagged.join(", ")}.`);
  }
  if (parts.length === 0) {
    parts.push(`Moderate fit based on technology keywords and federal market alignment.`);
  }

  return parts.join(" ");
}

export async function matchSolicitations(
  company: CompanyProfile,
  solicitations: SolicitationRow[],
): Promise<MatchedSolicitation[]> {
  if (solicitations.length === 0) return [];

  const corpus = companyCorpus(company);

  const scored = solicitations.map((solicitation) => {
    const keyword = overlapScore(corpus, solicitationCorpus(solicitation));
    const department = scoreDepartment(company, solicitation);
    const type = scoreSolicitationType(company, solicitation);
    const flag = scoreCompanyFlag(company, solicitation);
    const trl = scoreTrl(company, solicitation);

    const matchScore = Math.round(
      keyword * 35 + department * 0.25 + type * 0.15 + flag * 0.1 + trl * 0.15,
    );

    return {
      solicitation,
      matchScore: Math.min(100, Math.max(0, matchScore)),
      matchRationale: buildRationale(company, solicitation, { keyword, department, type }),
    };
  });

  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, TOP_MATCH_COUNT);
}

export function profileKeywords(company: CompanyProfile): string[] {
  return Array.from(new Set(tokenize(companyCorpus(company)))).slice(0, 20);
}

export interface CatalogSearchResult {
  rowIndex: number;
  displayTitle: string;
  department: string;
  dueDate: string;
  solicitationType: string;
  link: string;
  score: number;
}

/** @deprecated Use CatalogSearchResult */
export type KeywordSearchResult = CatalogSearchResult;

export function searchSolicitations(
  query: string,
  solicitations: SolicitationRow[],
  limit = 10,
): CatalogSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return solicitations
    .map((solicitation) => ({
      solicitation,
      score: Math.round(textMatchScore(trimmed, solicitationCorpus(solicitation)) * 100),
    }))
    .filter((r) => r.score >= 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ solicitation, score }) => ({
      rowIndex: solicitation.rowIndex,
      displayTitle: resolveDisplayTitle(solicitation),
      department: solicitation.department,
      dueDate: solicitation.dueDate,
      solicitationType: solicitation.solicitationType,
      link: solicitation.link,
      score: Math.min(100, score),
    }));
}

/** @deprecated Use searchSolicitations */
export const searchSolicitationsByKeywords = searchSolicitations;
