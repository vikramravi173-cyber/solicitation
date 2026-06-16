"use client";

import type { AnalysisResult } from "@/lib/domain/types";
import Link from "next/link";
import { OpportunityCard } from "./OpportunityCard";

interface FinalReportViewProps {
  result: AnalysisResult;
}

export function FinalReportView({ result }: FinalReportViewProps) {
  const { report, analyzedOpportunities, company } = result;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-blue-600">Analysis complete</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Recommendations for {company.companyName}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Generated {new Date(report.generatedAt).toLocaleString()}
        </p>
      </header>

      <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Executive summary</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {report.executiveSummary}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Top picks</h2>
        <div className="mt-4 space-y-3">
          {report.recommendedOpportunities.map((rec) => (
            <div
              key={rec.solicitationNumber}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">
                  #{rec.rank} {rec.title}
                </p>
                <span className="text-sm text-slate-600">
                  {rec.likelihoodLabel} ({rec.likelihoodScore}%)
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{rec.whyRecommended}</p>
              <p className="mt-1 text-xs text-slate-500">
                {rec.department} · Due {rec.dueDate}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Opportunity deep dives</h2>
        <div className="mt-4 space-y-6">
          {analyzedOpportunities.map((opp, index) => (
            <OpportunityCard
              key={opp.match.solicitation.solicitationNumber}
              rank={index + 1}
              title={opp.match.solicitation.title}
              department={opp.match.solicitation.department}
              dueDate={opp.match.solicitation.dueDate}
              link={opp.match.solicitation.link}
              matchScore={opp.match.matchScore}
              matchRationale={opp.match.matchRationale}
              summary={opp.summary.onePageSummary}
              acceptance={opp.acceptance}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Overall strategy</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {report.overallStrategy}
        </p>
      </section>

      <div className="flex gap-4">
        <Link
          href="/analyze"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-white"
        >
          Run another analysis
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
