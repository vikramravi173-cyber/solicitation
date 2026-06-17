"use client";

import type { AnalysisResult, AnalyzedOpportunity } from "@/lib/domain/types";
import { formatDueDate, formatReportTimestamp } from "@/lib/reporting/format-display";
import Link from "next/link";
import { useMemo, useState } from "react";
import { GrantReportModal } from "./GrantReportModal";
import { OpportunityCard } from "./OpportunityCard";

interface FinalReportViewProps {
  result: AnalysisResult;
}

function combinedScore(opportunity: AnalyzedOpportunity): number {
  return opportunity.match.matchScore * 0.5 + opportunity.acceptance.likelihoodScore * 0.5;
}

export function FinalReportView({ result }: FinalReportViewProps) {
  const { report, analyzedOpportunities, catalogProfileCount, company } = result;
  const [selectedRank, setSelectedRank] = useState<number | null>(null);

  const rankedOpportunities = useMemo(
    () => [...analyzedOpportunities].sort((a, b) => combinedScore(b) - combinedScore(a)),
    [analyzedOpportunities],
  );

  const selectedOpportunity =
    selectedRank !== null ? rankedOpportunities[selectedRank - 1] ?? null : null;

  const topScore = rankedOpportunities[0]
    ? Math.round(
        rankedOpportunities[0].match.matchScore * 0.5 +
          rankedOpportunities[0].acceptance.likelihoodScore * 0.5,
      )
    : 0;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-700/60 pb-8">
        <div>
          <span className="badge">Analysis complete</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Your solicitation recommendations
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Generated {formatReportTimestamp(report.generatedAt)} · {catalogProfileCount}{" "}
            solicitations profiled in catalog · {rankedOpportunities.length} top matches analyzed
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-secondary no-print !py-2.5"
        >
          Print report
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Catalog profiled", value: String(catalogProfileCount) },
          { label: "Top matches", value: String(rankedOpportunities.length) },
          { label: "Best combined score", value: topScore ? `${topScore}%` : "—" },
        ].map((stat) => (
          <div key={stat.label} className="card !p-5 text-center">
            <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-950/50 to-indigo-950/40 p-8 shadow-card">
        <h2 className="text-lg font-bold text-slate-50">Executive summary</h2>
        <p className="report-prose mt-4">{report.executiveSummary}</p>
      </section>

      <section>
        <h2 className="section-label">Top picks — tailored to your profile</h2>
        <p className="mt-1 text-sm text-slate-400">
          Selected from {catalogProfileCount} full solicitation profiles based on fit and likelihood
          of success.
        </p>
        <div className="mt-4 space-y-3">
          {report.recommendedOpportunities.map((rec) => (
            <button
              key={`${rec.rank}-${rec.title}`}
              type="button"
              onClick={() => setSelectedRank(rec.rank)}
              className="card group flex w-full flex-wrap items-center justify-between gap-4 !p-5 text-left transition hover:border-blue-500/50 hover:bg-slate-800/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                  {rec.rank}
                </span>
                <div>
                  <p className="font-semibold text-slate-50 group-hover:text-blue-100">{rec.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {rec.department} · Due {formatDueDate(rec.dueDate)}
                    {rec.pursuitRecommendation ? ` · ${rec.pursuitRecommendation}` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-400">{rec.likelihoodScore}%</p>
                <p className="text-xs font-medium text-slate-500">{rec.likelihoodLabel}</p>
                <p className="mt-1 text-xs font-medium text-blue-400/80 opacity-0 transition group-hover:opacity-100">
                  View report →
                </p>
              </div>
              <p className="report-prose w-full">{rec.whyRecommended}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-label">Full solicitation briefs</h2>
        <p className="mt-1 text-sm text-slate-400">
          Each brief synthesizes the solicitation details with a tailored assessment of fit,
          likelihood of success, and application guidance.
        </p>
        <div className="mt-6 space-y-6">
          {rankedOpportunities.map((opp, index) => (
            <OpportunityCard
              key={opp.match.solicitation.rowIndex}
              rank={index + 1}
              department={opp.match.solicitation.department}
              dueDate={opp.match.solicitation.dueDate}
              link={opp.match.solicitation.link}
              matchScore={opp.match.matchScore}
              matchRationale={opp.match.matchRationale}
              summary={opp.summary}
              acceptance={opp.acceptance}
            />
          ))}
        </div>
      </section>

      <section className="card !p-8">
        <h2 className="text-lg font-bold text-slate-50">Overall strategy</h2>
        <p className="report-prose mt-4">{report.overallStrategy}</p>
      </section>

      <div className="no-print flex flex-wrap gap-4">
        <Link href="/analyze" className="btn-secondary">
          Run another analysis
        </Link>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>

      {selectedOpportunity && selectedRank !== null && (
        <GrantReportModal
          rank={selectedRank}
          opportunity={selectedOpportunity}
          company={company}
          onClose={() => setSelectedRank(null)}
        />
      )}
    </div>
  );
}
