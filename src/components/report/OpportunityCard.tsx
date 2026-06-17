"use client";

import type { AcceptanceAssessment, OpportunitySummary } from "@/lib/domain/types";
import { formatDueDate } from "@/lib/reporting/format-display";

function likelihoodColor(label: AcceptanceAssessment["likelihoodLabel"]) {
  switch (label) {
    case "Very High":
      return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";
    case "High":
      return "bg-green-500/15 text-green-300 ring-green-500/30";
    case "Moderate":
      return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
    default:
      return "bg-slate-700/60 text-slate-300 ring-slate-600";
  }
}

function pursuitColor(rec: string) {
  switch (rec) {
    case "Strong pursue":
      return "text-emerald-300 bg-emerald-500/15 ring-emerald-500/25";
    case "Pursue with teaming":
      return "text-blue-300 bg-blue-500/15 ring-blue-500/25";
    case "Monitor":
      return "text-amber-300 bg-amber-500/15 ring-amber-500/25";
    default:
      return "text-slate-400 bg-slate-800 ring-slate-700";
  }
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h4 className="report-section-title">{title}</h4>
      <div className="report-prose mt-2">{children}</div>
    </div>
  );
}

interface OpportunityCardProps {
  rank: number;
  department: string;
  dueDate: string;
  link: string;
  matchScore: number;
  matchRationale: string;
  summary: OpportunitySummary;
  acceptance: AcceptanceAssessment;
}

export function OpportunityCard({
  rank,
  department,
  dueDate,
  link,
  matchScore,
  matchRationale,
  summary,
  acceptance,
}: OpportunityCardProps) {
  const { profile, tailored } = summary;
  const formattedDue = formatDueDate(dueDate);

  return (
    <article className="card !p-8 print:break-inside-avoid">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-700/60 pb-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-sm font-bold text-blue-300 ring-1 ring-blue-500/30">
            {rank}
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-50">{profile.displayTitle}</h3>
            {profile.catalogTitle && profile.catalogTitle !== profile.displayTitle && (
              <p className="mt-0.5 text-xs text-slate-500">
                Catalog title: {profile.catalogTitle || "(not listed)"}
              </p>
            )}
            <p className="mt-1 text-sm text-slate-400">
              {department}
              {profile.organization ? ` · ${profile.organization}` : ""}
              {profile.solicitationType ? ` · ${profile.solicitationType}` : ""}
              {" · Due "}
              {formattedDue}
              {" · Match "}
              {matchScore}%
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold ring-1 ${likelihoodColor(acceptance.likelihoodLabel)}`}
          >
            {acceptance.likelihoodLabel} ({acceptance.likelihoodScore}%)
          </span>
          <span
            className={`rounded-lg px-3 py-1 text-xs font-semibold ring-1 ${pursuitColor(tailored.pursuitRecommendation)}`}
          >
            {tailored.pursuitRecommendation}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {profile.solicitationNumber && (
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-slate-300">Solicitation #</span>{" "}
            {profile.solicitationNumber}
          </p>
        )}
        {profile.keyWords && (
          <p className="text-sm text-slate-400 sm:col-span-2">
            <span className="font-semibold text-slate-300">Focus areas</span> {profile.keyWords}
          </p>
        )}
      </div>

      {link && (
        <p className="mt-3 text-sm">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            View official solicitation →
          </a>
        </p>
      )}

      <ReportSection title="Summary">{profile.summary}</ReportSection>
      <ReportSection title="Who can submit">{profile.whoCanSubmit}</ReportSection>
      <ReportSection title="Funding">{profile.funding}</ReportSection>
      <ReportSection title="Requirements / documents to submit">{profile.requirements}</ReportSection>
      <ReportSection title="Evaluation criteria">{profile.evaluationCriteria}</ReportSection>

      <div className="report-highlight mt-8">
        <h4 className="text-sm font-bold text-blue-300">Why you should apply</h4>
        <p className="report-prose mt-2">{tailored.whyApply}</p>
        <p className="mt-4 rounded-lg border border-slate-700/60 bg-slate-800/50 p-3 text-sm text-slate-400">
          <span className="font-semibold text-slate-300">Match rationale: </span>
          {matchRationale}
        </p>
      </div>

      <ReportSection title="Likelihood of success">{tailored.likelihoodNarrative}</ReportSection>

      <div className="mt-6">
        <h4 className="report-section-title">Things to mention in your application</h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          {tailored.applicationTalkingPoints.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="shrink-0 text-blue-400">→</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <ReportSection title="Teaming & eligibility notes">{tailored.teamingAndEligibility}</ReportSection>

      <div className="mt-6 grid gap-6 border-t border-slate-700/60 pt-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Strengths</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-400">
            {acceptance.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-emerald-400">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Gaps & risks</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-400">
            {tailored.risksForCompany.map((w) => (
              <li key={w} className="flex gap-2">
                <span className="text-amber-400">!</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {profile.catalogGaps.length > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          Catalog data gaps: {profile.catalogGaps.join("; ")}
        </p>
      )}
    </article>
  );
}
