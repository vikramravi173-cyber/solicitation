import { meaningful } from "@/lib/ui/format";
import type { SolicitationRow } from "./types";

export type CatalogConfidenceLevel = "high" | "moderate" | "low";

export interface CatalogConfidence {
  level: CatalogConfidenceLevel;
  label: string;
  gapCount: number;
  gaps: string[];
  /** Short tooltip for badges */
  hint: string;
}

/** Fields missing or placeholder (TBD/TBA) in the bundled catalog. */
export function catalogDataGaps(row: SolicitationRow): string[] {
  const gaps: string[] = [];
  if (!meaningful(row.title)) gaps.push("title");
  if (!row.link) gaps.push("official link");
  if (!meaningful(row.description)) gaps.push("description");
  if (!meaningful(row.dueDate)) gaps.push("due date");
  if (!meaningful(row.solicitationType)) gaps.push("solicitation type");
  if (!meaningful(row.organization)) gaps.push("organization");
  if (!meaningful(row.keyWords)) gaps.push("keywords");
  if (!meaningful(row.applicants)) gaps.push("eligible applicants");
  return gaps;
}

export function assessCatalogConfidence(row: SolicitationRow): CatalogConfidence {
  const gaps = catalogDataGaps(row);
  const gapCount = gaps.length;

  if (gapCount <= 2) {
    return {
      level: "high",
      label: "Good data",
      gapCount,
      gaps,
      hint: "Enough catalog metadata for a useful dossier brief.",
    };
  }

  if (gapCount <= 4) {
    return {
      level: "moderate",
      label: "Partial data",
      gapCount,
      gaps,
      hint: `Missing ${gaps.join(", ")}. Verify in the official solicitation.`,
    };
  }

  return {
    level: "low",
    label: "Thin catalog",
    gapCount,
    gaps,
    hint: `Sparse catalog entry (missing ${gaps.join(", ")}). Dossier will lean on generic guidance — find the official release before deciding.`,
  };
}
