import { readFileSync } from "fs";
import { join } from "path";
import type { SolicitationRow } from "@/lib/solicitations/types";

interface SolicitationsDatabase {
  source: string;
  parsedAt: string;
  count: number;
  solicitations: SolicitationRow[];
}

let cache: SolicitationRow[] | null = null;

function getDataPath(): string {
  return join(process.cwd(), "data/solicitations.json");
}

export function getSolicitationsDatabaseMeta(): Pick<
  SolicitationsDatabase,
  "source" | "parsedAt" | "count"
> | null {
  try {
    const raw = readFileSync(getDataPath(), "utf-8");
    const data = JSON.parse(raw) as SolicitationsDatabase;
    return {
      source: data.source,
      parsedAt: data.parsedAt,
      count: data.count,
    };
  } catch {
    return null;
  }
}

export async function fetchSolicitations(): Promise<SolicitationRow[]> {
  if (cache) return cache;

  const raw = readFileSync(getDataPath(), "utf-8");
  const data = JSON.parse(raw) as SolicitationsDatabase;

  if (!data.solicitations?.length) {
    throw new Error(
      "No solicitations in database. Run npm run parse-pdf to generate data/solicitations.json from the PDF.",
    );
  }

  cache = data.solicitations;
  return cache;
}

export function clearSolicitationsCache(): void {
  cache = null;
}
