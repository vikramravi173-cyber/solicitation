"use client";

const STEPS = [
  "Loading solicitations database",
  "Building profiles for all solicitations",
  "Matching opportunities to your company",
  "Researching top matches online",
  "Tailoring reports and scoring likelihood",
  "Generating your recommendation report",
];

export function AnalysisLoader({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-card-lg">
        <div className="bg-blue-600 px-8 py-6 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
          <h2 className="mt-4 text-lg font-bold text-white">Running your analysis</h2>
          <p className="mt-1 text-sm text-blue-100">Usually under a minute</p>
        </div>
        <ul className="space-y-3 p-8">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-sm text-slate-400">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i === 0 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
