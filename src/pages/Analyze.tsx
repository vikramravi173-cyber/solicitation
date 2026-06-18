import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionnaireForm } from "@/components/QuestionnaireForm";
import { runAnalysis, type AnalysisProgress } from "@/lib/pipeline/analyze";
import { storeAnalysis } from "@/state/analysis";
import type { CompanyProfile } from "@/lib/company/questionnaire";

export function AnalyzePage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(profile: CompanyProfile) {
    setBusy(true);
    setError(null);
    try {
      // Yield to paint the loader before the synchronous scoring runs.
      await new Promise((r) => setTimeout(r, 30));
      const result = await runAnalysis(profile, (p) => setProgress(p));
      storeAnalysis(result);
      navigate("/report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while scoring.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-deck px-5 py-12">
      <header className="max-w-2xl">
        <div className="eyebrow">Company match</div>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-mist sm:text-4xl">
          Tell us what you build.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Answer the required fields across four sections to score your company against the full
          catalog. About five minutes; nothing leaves your browser.
        </p>
      </header>

      <div className="mt-10">
        <QuestionnaireForm onSubmit={handleSubmit} busy={busy} />
      </div>

      {error && (
        <div className="mt-6 border border-fit-low/40 bg-fit-low/10 px-4 py-3">
          <p className="text-[14px] text-fit-low">{error}</p>
          <p className="mt-1 text-[12px] text-faint">
            Adjust your answers and generate the dossier again.
          </p>
        </div>
      )}

      {busy && <Loader progress={progress} />}
    </div>
  );
}

const STAGES: { key: AnalysisProgress["stage"]; label: string }[] = [
  { key: "loading", label: "Load catalog" },
  { key: "matching", label: "Score fit across catalog" },
  { key: "scoring", label: "Assess top matches" },
  { key: "reporting", label: "Assemble dossier" },
  { key: "complete", label: "Ready" },
];

function Loader({ progress }: { progress: AnalysisProgress | null }) {
  const activeIndex = progress
    ? STAGES.findIndex((s) => s.key === progress.stage)
    : 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/85 backdrop-blur-sm">
      <div className="panel w-full max-w-md p-8 shadow-panel">
        <div className="eyebrow">Working</div>
        <p className="mt-3 min-h-[44px] text-[15px] text-mist">
          {progress?.message ?? "Starting…"}
        </p>
        <div className="mt-5 h-1 w-full overflow-hidden bg-panel-2">
          <div className="h-full w-1/3 animate-sweep bg-brass" />
        </div>
        <ol className="mt-6 space-y-2.5">
          {STAGES.map((s, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <li key={s.key} className="flex items-center gap-3">
                <span
                  className={`grid h-5 w-5 place-items-center border font-mono text-[10px] ${
                    done
                      ? "border-fit-high/50 bg-fit-high/15 text-fit-high"
                      : active
                        ? "border-brass/60 bg-brass/15 text-brass"
                        : "border-line text-faint"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`text-[13px] ${
                    active ? "text-mist" : done ? "text-muted" : "text-faint"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
