import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { SolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import { buildSolicitationProfile, buildSolicitationProfilePool } from "@/lib/reporting/build-solicitation-profile";
import type { SolicitationRow } from "@/lib/solicitations/types";

interface ProfilesDatabase {
  generatedAt: string;
  count: number;
  profiles: SolicitationProfile[];
}

let cache: Map<number, SolicitationProfile> | null = null;

function getProfilesPath(): string {
  return join(process.cwd(), "data/solicitation-profiles.json");
}

export function getProfilesMeta(): Pick<ProfilesDatabase, "generatedAt" | "count"> | null {
  const path = getProfilesPath();
  if (!existsSync(path)) return null;
  try {
    const data = JSON.parse(readFileSync(path, "utf-8")) as ProfilesDatabase;
    return { generatedAt: data.generatedAt, count: data.count };
  } catch {
    return null;
  }
}

/**
 * Loads pre-generated catalog profiles when available, otherwise builds in memory.
 */
export function loadSolicitationProfilePool(
  solicitations: SolicitationRow[],
): Map<number, SolicitationProfile> {
  if (cache) return cache;

  const path = getProfilesPath();
  if (existsSync(path)) {
    try {
      const data = JSON.parse(readFileSync(path, "utf-8")) as ProfilesDatabase;
      if (data.profiles?.length) {
        cache = new Map(data.profiles.map((p) => [p.rowIndex, p]));
        return cache;
      }
    } catch {
      // Fall through to runtime generation
    }
  }

  cache = buildSolicitationProfilePool(solicitations);
  return cache;
}

export function enrichProfile(
  base: SolicitationProfile,
  solicitation: SolicitationRow,
  research?: Parameters<typeof buildSolicitationProfile>[1],
): SolicitationProfile {
  if (!research) return base;
  return buildSolicitationProfile(solicitation, research);
}

export function clearProfileCache(): void {
  cache = null;
}
