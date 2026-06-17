const PLACEHOLDER = new Set(["tbd", "tba", "n/a", "?", "not found", ""]);

export function meaningful(value: string | undefined | null): boolean {
  return !!value && !PLACEHOLDER.has(value.trim().toLowerCase());
}

/** Display a catalog field, or an em-dash when it is missing/placeholder. */
export function field(value: string | undefined | null): string {
  return meaningful(value) ? value!.trim() : "—";
}

/** Normalize a solicitation type into a coarse family for filtering/labels. */
export function typeFamily(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("sttr")) return "STTR";
  if (t.includes("sbir")) return "SBIR";
  if (t.includes("baa")) return "BAA";
  if (t.includes("prize") || t.includes("challenge")) return "Prize";
  if (t.includes("darpa")) return "DARPA";
  if (t.includes("usaf") || t.includes("af")) return "USAF";
  if (t.includes("navy")) return "Navy";
  if (t.includes("army")) return "Army";
  if (!meaningful(type)) return "Other";
  return "Other";
}
