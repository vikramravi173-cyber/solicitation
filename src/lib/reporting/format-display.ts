const PLACEHOLDER_DATES = new Set(["tbd", "tba", "n/a", "?", "not found", ""]);

function isPlaceholderDate(value: string): boolean {
  return PLACEHOLDER_DATES.has(value.trim().toLowerCase());
}

/** Normalize catalog due-date strings for display. */
export function formatDueDate(value: string | undefined | null): string {
  if (!value?.trim() || isPlaceholderDate(value)) return "TBD";
  return value.trim();
}

export function formatReportTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
