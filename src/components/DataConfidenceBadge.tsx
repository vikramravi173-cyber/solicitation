import type { CatalogConfidence } from "@/lib/solicitations/catalog-confidence";

const tone: Record<
  CatalogConfidence["level"],
  { chip: string; dot: string }
> = {
  high: {
    chip: "border-fit-vhigh/35 bg-fit-vhigh/10 text-fit-vhigh",
    dot: "bg-fit-vhigh",
  },
  moderate: {
    chip: "border-fit-mod/35 bg-fit-mod/10 text-fit-mod",
    dot: "bg-fit-mod",
  },
  low: {
    chip: "border-fit-low/35 bg-fit-low/10 text-fit-low",
    dot: "bg-fit-low",
  },
};

export function DataConfidenceBadge({
  confidence,
  compact = false,
}: {
  confidence: CatalogConfidence;
  compact?: boolean;
}) {
  const t = tone[confidence.level];

  return (
    <span
      title={confidence.hint}
      className={`inline-flex shrink-0 items-center gap-1.5 border font-mono uppercase tracking-wide ${t.chip} ${
        compact
          ? "px-1.5 py-0.5 text-[9.5px]"
          : "px-2 py-0.5 text-[10px]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {confidence.label}
    </span>
  );
}
