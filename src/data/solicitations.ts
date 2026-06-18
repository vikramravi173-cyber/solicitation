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
  /** Always derived from bundled rows so stats cannot drift from the JSON `count` field. */
  count: db.solicitations.length,
};
