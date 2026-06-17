import { SOLICITATIONS, CATALOG_META } from "@/data/solicitations";
import type { SolicitationRow } from "@/lib/solicitations/types";

export function getSolicitationsDatabaseMeta() {
  return CATALOG_META;
}

export async function fetchSolicitations(): Promise<SolicitationRow[]> {
  return SOLICITATIONS;
}

/** Synchronous access for client rendering (the catalog is bundled). */
export function getSolicitations(): SolicitationRow[] {
  return SOLICITATIONS;
}
