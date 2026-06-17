"use client";

import type { CompanyProfile } from "@/lib/company/questionnaire";
import type { AcceptanceAssessment, AnalyzedOpportunity } from "@/lib/domain/types";
import { formatDueDate } from "@/lib/reporting/format-display";
import {
  companyDisplayLabel,
  personalizeEvaluationCriteria,
  personalizeSummary,
  personalizeWhoCanSubmit,
  toBulletList,
} from "@/lib/reporting/format-report-sections";

interface OnePageGrantReportProps {
  rank: number;
  opportunity: AnalyzedOpportunity;
  company: CompanyProfile;
  acceptance: AcceptanceAssessment;
}

function ReportField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grant-report-field">
      <p className="report-section-title">{label}</p>
      <div className="report-prose mt-1.5">{children}</div>
    </div>
  );
}

export function OnePageGrantReport({
  rank,
  opportunity,
  company,
  acceptance,
}: OnePageGrantReportProps) {
  const { match, summary } = opportunity;
  const { profile, tailored } = summary;
  const companyLabel = companyDisplayLabel(company);
  const requirementBullets = toBulletList(profile.requirements);
  const evaluationText = personalizeEvaluationCriteria(
    profile.evaluationCriteria,
    companyLabel,
    company.technologyAndCapabilities,
  );

  return (
    <article className="grant-report-page space-y-6 print:break-inside-avoid">
      <header className="border-b border-slate-700/60 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
          Opportunity brief · #{rank}
        </p>
        <h2 className="mt-2 text-xl font-bold leading-snug text-slate-50 sm:text-2xl">
          {profile.displayTitle}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {match.solicitation.department}
          {profile.solicitationType ? ` · ${profile.solicitationType}` : ""}
          {" · Match "}
          {match.matchScore}%
          {" · "}
          {acceptance.likelihoodLabel} ({acceptance.likelihoodScore}%)
        </p>
      </header>

      <ReportField label="Solicitation title">
        <p>{profile.catalogTitle || profile.displayTitle}</p>
        {profile.solicitationNumber && (
          <p className="mt-1 text-slate-400">Solicitation #: {profile.solicitationNumber}</p>
        )}
      </ReportField>

      {profile.link && (
        <ReportField label="Link">
          <a
            href={profile.link}
            target="_blank"
            rel="noreferrer"
            className="break-all font-medium text-blue-400 hover:text-blue-300"
          >
            {profile.link}
          </a>
        </ReportField>
      )}

      <ReportField label="Deadline">
        <p>{formatDueDate(profile.dueDate || match.solicitation.dueDate)}</p>
      </ReportField>

      <ReportField label="Who can submit">
        <p>
          {personalizeWhoCanSubmit(profile.whoCanSubmit, tailored.teamingAndEligibility, companyLabel)}
        </p>
      </ReportField>

      <ReportField label="Summary">
        <p>{personalizeSummary(profile.summary, tailored.whyApply, companyLabel)}</p>
      </ReportField>

      <ReportField label="Funding">
        <p>{profile.funding}</p>
      </ReportField>

      <ReportField label="Requirements / documents to submit">
        {requirementBullets.length > 0 ? (
          <ul className="mt-1 space-y-2">
            {requirementBullets.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-300">
                <span className="shrink-0 text-blue-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{profile.requirements}</p>
        )}
      </ReportField>

      <ReportField label="Evaluation criteria">
        <p className="whitespace-pre-wrap">{evaluationText}</p>
      </ReportField>

      <div className="report-highlight">
        <p className="report-section-title">Personalized tips for {companyLabel}</p>
        <p className="report-prose mt-2">{tailored.likelihoodNarrative}</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {tailored.applicationTalkingPoints.slice(0, 5).map((point) => (
            <li key={point} className="flex gap-2">
              <span className="shrink-0 text-blue-400">→</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          Recommendation: {tailored.pursuitRecommendation}
          {summary.sourcesUsed.length > 0 && (
            <> · Sources: {summary.sourcesUsed.slice(0, 3).join(", ")}</>
          )}
        </p>
      </div>
    </article>
  );
}
