import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadAnalysis } from "@/state/analysis";
import type { AnalysisResult, AnalyzedOpportunity } from "@/lib/domain/types";
import { Seal } from "@/components/Seal";
import { fitTone, recommendationTone } from "@/lib/ui/fit";
import { field, meaningful } from "@/lib/ui/format";
import { formatReportTimestamp } from "@/lib/reporting/format-display";
import { formatReportSources } from "@/lib/reporting/format-sources";

export function ReportPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    setResult(loadAnalysis());
  }, []);

  const ranked = useMemo(
    () =>
      result
        ? [...result.analyzedOpportunities].sort(
            (a, b) =>
              b.match.matchScore * 0.5 +
              b.acceptance.likelihoodScore * 0.5 -
              (a.match.matchScore * 0.5 + a.acceptance.likelihoodScore * 0.5),
          )
        : [],
    [result],
  );

  if (!result) return <EmptyState />;

  return (
    <div className="bg-paper text-paper-ink">
      {/* Dossier masthead — dark strip bridging deck → paper */}
      <div className="no-print border-b border-line bg-ink">
        <div className="mx-auto flex max-w-dossier items-center justify-between px-6 py-3">
          <span className="font-mono text-[11px] uppercase tracking-eyebrow text-brass">
            Pursuit dossier
          </span>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-ghost py-2">
              Print / PDF
            </button>
            <Link to="/match" className="btn-quiet">
              New match
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-dossier gap-10 px-6 py-12 lg:grid-cols-[200px_1fr]">
        {/* Contents rail */}
        <nav className="no-print order-2 lg:order-1">
          <div className="sticky top-20 space-y-4">
            <div className="font-mono text-[11px] uppercase tracking-eyebrow text-paper-muted">
              Ranked pursuits
            </div>
            <ol className="space-y-2">
              {ranked.map((opp, i) => {
                const tone = fitTone(opp.acceptance.likelihoodLabel);
                return (
                  <li key={i}>
                    <a
                      href={`#opp-${i}`}
                      className="group flex items-start gap-2.5 border-l-2 border-paper-line py-1 pl-3 hover:border-paper-ink"
                    >
                      <span
                        className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: tone.hex }}
                      />
                      <span className="text-[12.5px] leading-snug text-paper-muted group-hover:text-paper-ink">
                        {opp.summary.profile.displayTitle}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>

        {/* Dossier body */}
        <article className="order-1 lg:order-2">
          <header className="border-b-2 border-paper-ink pb-6">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-eyebrow text-paper-muted">
              <span className="bg-paper-ink px-1.5 py-0.5 text-paper">Confidential</span>
              <span>Federal capture brief</span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight">
              Pursuit dossier
            </h1>
            <p className="mt-2 font-mono text-[12px] text-paper-muted">
              {ranked.length} ranked {ranked.length === 1 ? "opportunity" : "opportunities"} ·
              scored against {result.catalogProfileCount} solicitations · as of{" "}
              {formatReportTimestamp(result.report.generatedAt)}
            </p>
          </header>

          <Prose label="Executive summary" body={result.report.executiveSummary} />

          <div className="mt-12 space-y-12">
            {ranked.map((opp, i) => (
              <OpportunityBrief key={i} index={i} opp={opp} />
            ))}
          </div>

          <Prose label="Overall strategy" body={result.report.overallStrategy} className="mt-12" />

          <footer className="mt-12 border-t border-paper-line pt-5">
            <p className="font-mono text-[11px] leading-relaxed text-paper-muted">
              Method: rule-based scoring of keyword overlap, agency/instrument fit, and
              federal experience against catalog metadata. Estimated fit is a relative
              prioritization signal, not a prediction of award. Verify every figure
              against the official solicitation before committing bid resources.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}

function OpportunityBrief({ index, opp }: { index: number; opp: AnalyzedOpportunity }) {
  const { profile, tailored } = opp.summary;
  const tone = fitTone(opp.acceptance.likelihoodLabel);

  return (
    <section id={`opp-${index}`} className="scroll-mt-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 border-b border-paper-line pb-5">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold tabular text-paper-muted">
              #{index + 1}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-eyebrow text-paper-muted">
              {profile.department}
              {meaningful(profile.solicitationType) && ` · ${profile.solicitationType}`}
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold leading-tight">
            {profile.displayTitle}
          </h2>
          <div
            className={`mt-3 inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${tone.chip}`}
          >
            {tailored.pursuitRecommendation}
          </div>
        </div>
        <Seal
          score={opp.acceptance.likelihoodScore}
          label={opp.acceptance.likelihoodLabel}
          size={88}
          onPaper
        />
      </div>

      {/* Score readout */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ScoreBar
          label="Keyword & domain match"
          value={opp.match.matchScore}
          hex="#7C6231"
        />
        <ScoreBar label="Estimated fit" value={opp.acceptance.likelihoodScore} hex={tone.hex} />
      </div>

      {/* Why it fits */}
      <Block label="Why it fits you">{tailored.whyApply}</Block>

      {meaningful(profile.synthesizedOverview) && (
        <Block label="Opportunity overview">{profile.synthesizedOverview}</Block>
      )}

      {meaningful(profile.funding) && !profile.funding.toLowerCase().includes("not listed in the catalog") && (
        <Block label="Funding">{profile.funding}</Block>
      )}

      {/* Snapshot */}
      <div className="mt-5 grid gap-px overflow-hidden border border-paper-line bg-paper-line sm:grid-cols-2">
        <Fact label="Eligible applicants" value={field(profile.applicants)} />
        <Fact label="Due date" value={field(profile.dueDate)} mono />
        <Fact label="Organization" value={field(profile.organization)} />
        <Fact label="Solicitation #" value={field(profile.solicitationNumber)} mono />
      </div>

      {/* Strengths & gaps */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <List label="Strengths" tone="#3F8F6E" items={opp.acceptance.strengths.slice(0, 4)} />
        <List label="Gaps to close" tone="#C2603F" items={opp.acceptance.weaknesses.slice(0, 4)} />
      </div>

      {/* Guidance */}
      <Block label="In your application">{tailored.applicationGuidance}</Block>

      {meaningful(tailored.teamingAndEligibility) && (
        <Block label="Teaming & eligibility">{tailored.teamingAndEligibility}</Block>
      )}

      {/* Sources — one labeled link, no duplicate URLs in prose above */}
      <SourcesList sources={opp.summary.sourcesUsed} officialLink={profile.link} />
    </section>
  );
}

function SourcesList({
  sources,
  officialLink,
}: {
  sources: string[];
  officialLink?: string;
}) {
  const formatted = formatReportSources(sources, officialLink);
  if (formatted.length === 0) return null;

  return (
    <div className="mt-5">
      <Label>Sources</Label>
      <ul className="mt-1.5 space-y-1.5">
        {formatted.map((s) => (
          <li key={s.label + (s.href ?? "")} className="text-[13px] text-paper-muted">
            {s.href ? (
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[12px] underline hover:text-paper-ink"
              >
                {s.label}
              </a>
            ) : (
              s.label
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreBar({ label, value, hex }: { label: string; value: number; hex: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-eyebrow text-paper-muted">
          {label}
        </span>
        <span className="font-mono text-sm font-semibold tabular" style={{ color: hex }}>
          {value}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden bg-paper-2">
        <div
          className="h-full"
          style={{ width: `${value}%`, background: hex, transition: "width 0.8s ease" }}
        />
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-eyebrow text-paper-muted">
      {children}
    </span>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <Label>{label}</Label>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-paper-ink/90">{children}</p>
    </div>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-paper p-3.5">
      <dt className="font-mono text-[10.5px] uppercase tracking-eyebrow text-paper-muted">
        {label}
      </dt>
      <dd className={`mt-1 text-[13.5px] text-paper-ink ${mono ? "font-mono tabular" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function List({ label, tone, items }: { label: string; tone: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <Label>{label}</Label>
      <ul className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-snug text-paper-ink/90">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: tone }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Prose({
  label,
  body,
  className = "",
}: {
  label: string;
  body: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="font-mono text-[11px] uppercase tracking-eyebrow text-paper-muted">
        {label}
      </h2>
      <div className="mt-2 space-y-3">
        {body
          .split(/\n\n+/)
          .filter(Boolean)
          .map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-paper-ink/90">
              {p}
            </p>
          ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-deck place-items-center px-5">
      <div className="max-w-md text-center">
        <div className="eyebrow">No dossier yet</div>
        <h1 className="mt-3 font-display text-2xl font-bold text-mist">
          Run a match to generate a dossier.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Dossiers are built in your browser and aren’t saved between sessions. Start a
          company match or open any solicitation from the catalog.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/match" className="btn-primary py-3">
            Run company match →
          </Link>
          <Link to="/" className="btn-ghost py-3">
            Browse catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
