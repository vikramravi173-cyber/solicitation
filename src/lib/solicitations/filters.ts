import type { Company } from "@/lib/solicitations/constants";
import type { SearchFilters, SolicitationRow } from "@/lib/solicitations/types";

function matchesDepartment(row: SolicitationRow, department?: string): boolean {
  if (!department) return true;
  return row.department.toLowerCase().includes(department.toLowerCase());
}

function matchesSolicitationType(
  row: SolicitationRow,
  solicitationType?: string,
): boolean {
  if (!solicitationType) return true;
  return row.solicitationType.toLowerCase().includes(solicitationType.toLowerCase());
}

function matchesCompany(row: SolicitationRow, company?: Company): boolean {
  if (!company) return true;
  return row.companyFlags[company] === true;
}

export function applyFilters(
  rows: SolicitationRow[],
  filters?: SearchFilters,
): SolicitationRow[] {
  if (!filters) return rows;

  return rows.filter(
    (row) =>
      matchesDepartment(row, filters.department) &&
      matchesSolicitationType(row, filters.solicitationType) &&
      matchesCompany(row, filters.company),
  );
}
