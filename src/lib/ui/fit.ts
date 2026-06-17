import type { AcceptanceAssessment } from "@/lib/domain/types";

type Label = AcceptanceAssessment["likelihoodLabel"];

/** Maps an estimated-fit label to its semantic color token + Tailwind classes. */
export function fitTone(label: Label): {
  hex: string;
  text: string;
  ring: string;
  fill: string;
  chip: string;
} {
  switch (label) {
    case "Very High":
      return {
        hex: "#3F8F6E",
        text: "text-fit-vhigh",
        ring: "stroke-fit-vhigh",
        fill: "bg-fit-vhigh",
        chip: "text-fit-vhigh border-fit-vhigh/40 bg-fit-vhigh/10",
      };
    case "High":
      return {
        hex: "#5CA372",
        text: "text-fit-high",
        ring: "stroke-fit-high",
        fill: "bg-fit-high",
        chip: "text-fit-high border-fit-high/40 bg-fit-high/10",
      };
    case "Moderate":
      return {
        hex: "#CDA53C",
        text: "text-fit-mod",
        ring: "stroke-fit-mod",
        fill: "bg-fit-mod",
        chip: "text-fit-mod border-fit-mod/40 bg-fit-mod/10",
      };
    default:
      return {
        hex: "#C2603F",
        text: "text-fit-low",
        ring: "stroke-fit-low",
        fill: "bg-fit-low",
        chip: "text-fit-low border-fit-low/40 bg-fit-low/10",
      };
  }
}

/** Short, honest verb for a pursuit recommendation. */
export function recommendationTone(rec: string): string {
  const r = rec.toLowerCase();
  if (r.includes("strong")) return "text-fit-vhigh";
  if (r.includes("teaming")) return "text-fit-high";
  if (r.includes("monitor")) return "text-fit-mod";
  return "text-faint";
}
