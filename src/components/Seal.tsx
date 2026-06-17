import type { AcceptanceAssessment } from "@/lib/domain/types";
import { fitTone } from "@/lib/ui/fit";

interface SealProps {
  score: number;
  label: AcceptanceAssessment["likelihoodLabel"];
  size?: number;
  /** Light-surface (dossier) variant uses paper-appropriate track color. */
  onPaper?: boolean;
}

/**
 * The signature element: a stamped brass-ring gauge — a federal-seal motif that
 * reads the estimated-fit score. The arc fills to the score; the tier label sits
 * dead-center like a seal device.
 */
export function Seal({ score, label, size = 96, onPaper = false }: SealProps) {
  const tone = fitTone(label);
  const stroke = 5;
  const r = (size - stroke * 2 - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const center = size / 2;
  const track = onPaper ? "#C9BC9C" : "#2A3A33";

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Estimated fit ${score} percent, ${label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* outer seal ring */}
        <circle
          cx={center}
          cy={center}
          r={size / 2 - 1.5}
          fill="none"
          stroke={onPaper ? "#C9BC9C" : "#3A4F46"}
          strokeWidth={1}
          strokeDasharray="2 4"
          opacity={0.7}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={tone.hex}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.2,0.7,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className="font-mono font-semibold tabular leading-none"
            style={{ fontSize: size * 0.26, color: tone.hex }}
          >
            {score}
          </div>
          <div
            className={`font-mono uppercase tracking-eyebrow leading-none mt-1 ${onPaper ? "text-paper-muted" : "text-faint"}`}
            style={{ fontSize: size * 0.085 }}
          >
            fit
          </div>
        </div>
      </div>
    </div>
  );
}
