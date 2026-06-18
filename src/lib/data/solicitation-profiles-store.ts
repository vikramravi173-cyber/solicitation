import type { SolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import { buildSolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import type { SolicitationRow } from "@/lib/solicitations/types";
import type { ScrapedContent } from "@/lib/domain/types";

const cache = new Map<number, SolicitationProfile>();

/**
 * Builds catalog profiles on demand from the bundled solicitation rows.
 * No external research is performed — profiles are synthesized from catalog
 * fields, which keeps the matcher fully client-side and deterministic.
 */
export function loadSolicitationProfilePool(
  _solicitations: SolicitationRow[],
): Map<number, SolicitationProfile> {
  return cache;
}

/** Always rebuilds so profile text reflects latest formatting rules. */
export async function getOrBuildProfile(
  solicitation: SolicitationRow,
): Promise<SolicitationProfile> {
  const profile = await buildSolicitationProfile(solicitation);
  cache.set(solicitation.rowIndex, profile);
  return profile;
}

export function enrichProfile(
  base: SolicitationProfile,
  _solicitation: SolicitationRow,
  _research?: ScrapedContent,
): SolicitationProfile {
  return base;
}
