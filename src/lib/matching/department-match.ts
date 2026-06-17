/** Shared department matching used by scoring and fit analysis. */

export function departmentMatchesTarget(targetDepartments: string, department: string): boolean {
  if (!targetDepartments.trim() || !department.trim()) return false;

  const raw = targetDepartments
    .replace(/\s*\/\s*/g, " ")
    .split(/[,;/]+/)
    .map((d) => d.trim())
    .filter(Boolean);
  const targets = [targetDepartments, ...raw];
  const dept = department.toLowerCase();

  if (
    targets.some((t) => {
      const lower = t.toLowerCase();
      return dept.includes(lower) || lower.includes(dept) || lower.includes("multiple dod");
    })
  ) {
    return true;
  }

  const targetsLower = targetDepartments.toLowerCase();
  if (targetsLower.includes("air force") && dept.includes("air")) return true;
  if (targetsLower.includes("navy") && dept.includes("navy")) return true;
  if (targetsLower.includes("army") && dept.includes("army")) return true;

  return false;
}
