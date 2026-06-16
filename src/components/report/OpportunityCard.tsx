"use client";

import type { AcceptanceAssessment } from "@/lib/domain/types";

function likelihoodColor(label: AcceptanceAssessment["likelihoodLabel"]) {
  switch (label) {
    case "Very High":
      return "bg-green-100 text-green-800";
    case "High":
      return "bg-emerald-100 text-emerald-800";
    case "Moderate":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

interface OpportunityCardProps {
  rank: number;
  title: string;
  department: string;
  dueDate: string;
  link: string;
  matchScore: number;
  matchRationale: string;
  summary: string;
  acceptance: AcceptanceAssessment;
}

export function OpportunityCard({
  rank,
  title,
  department,
  dueDate,
  link,
  matchScore,
  matchRationale,
  summary,
  acceptance,
}: OpportunityCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">#{rank}</p>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {department} · Due {dueDate} · Match {matchScore}%
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${likelihoodColor(acceptance.likelihoodLabel)}`}
        >
          {acceptance.likelihoodLabel} ({acceptance.likelihoodScore}%)
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-700">
        <span className="font-medium">Why it matched:</span> {matchRationale}
      </p>

      <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {summary}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Strengths</p>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
            {acceptance.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Gaps</p>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
            {acceptance.weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm text-blue-700 underline"
        >
          View solicitation
        </a>
      )}
    </article>
  );
}
