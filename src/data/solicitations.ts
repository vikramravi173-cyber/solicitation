import raw from "../../data/solicitations.json";
import type { SolicitationRow } from "@/lib/solicitations/types";

interface SolicitationsDatabase {
  source: string;
  parsedAt: string;
  count: number;
  solicitations: SolicitationRow[];
}

const db = raw as SolicitationsDatabase;

export const SOLICITATIONS: SolicitationRow[] = db.solicitations;

export const CATALOG_META = {
  source: db.source,
  parsedAt: db.parsedAt,
  count: db.count,
};
