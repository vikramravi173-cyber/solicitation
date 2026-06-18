import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadAnalysis } from "@/state/analysis";
import type { AnalysisResult, AnalyzedOpportunity } from "@/lib/domain/types";
import { Seal } from "@/components/Seal";
import { SummaryContent } from "@/components/report/SummaryContent";
import { fitTone } from "@/lib/ui/fit";
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

          <SummarySection label="Executive summary" body={result.report.executiveSummary} />

          {result.report.recommendedOpportunities.length > 1 && (
            <RankedTable opportunities={result.report.recommendedOpportunities} />
          )}

          <div className="mt-12 space-y-16">
            {ranked.map((opp, i) => (
              <OpportunityBrief key={i} index={i} opp={opp} />
            ))}
          </div>

          <SummarySection
            label="Overall strategy"
            body={result.report.overallStrategy}
            className="mt-16"
          />

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

function RankedTable({
  opportunities,
}: {
  opportunities: AnalysisResult["report"]["recommendedOpportunities"];
}) {
  return (
    <div className="mt-8 overflow-hidden border border-paper-line">
      <div className="bg-paper-2 px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-eyebrow text-paper-muted">
          At a glance
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-paper-line bg-paper">
              <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-eyebrow text-paper-muted">
                #
              </th>
              <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-eyebrow text-paper-muted">
                Opportunity
              </th>
              <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-eyebrow text-paper-muted">
                Due
              </th>
              <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-eyebrow text-paper-muted">
                Fit
              </th>
              <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-eyebrow text-paper-muted">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => {
              const tone = fitTone(opp.likelihoodLabel);
              return (
                <tr key={opp.rank} className="border-b border-paper-line/60 last:border-0">
                  <td className="px-4 py-3 font-mono tabular text-paper-muted">{opp.rank}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium leading-snug">{opp.title}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-paper-muted">
                      {opp.department}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] tabular text-paper-muted">
                    {opp.dueDate}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-semibold tabular" style={{ color: tone.hex }}>
                      {opp.likelihoodScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-paper-muted">
                    {opp.pursuitRecommendation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OpportunityBrief({ index, opp }: { index: number; opp: AnalyzedOpportunity }) {
  const { profile, tailored } = opp.summary;
  const tone = fitTone(opp.acceptance.likelihoodLabel);

  return (
    <section id={`opp-${index}`} className="scroll-mt-20 break-inside-avoid">
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

      <div className="mt-5 grid gap-px overflow-hidden border border-paper-line bg-paper-line sm:grid-cols-2">
        <Fact label="Due date" value={field(profile.dueDate)} mono />
        <Fact label="Eligible applicants" value={field(profile.applicants)} />
        <Fact label="Organization" value={field(profile.organization)} />
        <Fact label="Solicitation #" value={field(profile.solicitationNumber)} mono />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ScoreBar label="Keyword & domain match" value={opp.match.matchScore} hex="#7C6231" />
        <ScoreBar label="Estimated fit" value={opp.acceptance.likelihoodScore} hex={tone.hex} />
      </div>

      <Block label="Why it fits you">
        <SummaryContent body={tailored.whyApply} />
      </Block>

      {meaningful(profile.synthesizedOverview) && (
        <Block label="Opportunity overview">
          <SummaryContent body={profile.synthesizedOverview} />
        </Block>
      )}

      {meaningful(profile.funding) && !profile.funding.toLowerCase().includes("not listed in the catalog") && (
        <Block label="Funding" compact>
          <SummaryContent body={profile.funding} />
        </Block>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <List label="Strengths" tone="#3F8F6E" items={opp.acceptance.strengths.slice(0, 4)} />
        <List label="Gaps to close" tone="#C2603F" items={opp.acceptance.weaknesses.slice(0, 4)} />
      </div>

      <Block label="Next steps for your application">
        <SummaryContent body={tailored.applicationGuidance} numbered />
      </Block>

      {meaningful(tailored.teamingAndEligibility) && (
        <Block label="Teaming & eligibility">
          <SummaryContent body={tailored.teamingAndEligibility} />
        </Block>
      )}

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
    <div className="mt-6">
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

function Block({
  label,
  children,
  compact = false,
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mt-5" : "mt-6"}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
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

function SummarySection({
  label,
  body,
  className = "",
}: {
  label: string;
  body: string;
  className?: string;
}) {
  return (
    <section className={`mt-8 ${className}`}>
      <h2 className="font-mono text-[11px] uppercase tracking-eyebrow text-paper-muted">
        {label}
      </h2>
      <div className="mt-3 rounded-sm border border-paper-line bg-paper-2/40 px-4 py-3">
        <SummaryContent body={body} />
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
