"use client";

import { STORAGE_KEY } from "@/components/questionnaire/QuestionnaireForm";
import { FinalReportView } from "@/components/report/FinalReportView";
import type { AnalysisResult } from "@/lib/domain/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ReportPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setResult(JSON.parse(raw) as AnalysisResult);
      } catch {
        setResult(null);
      }
    }
  }, []);

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-slate-900">No report found</h1>
          <p className="mt-2 text-slate-600">
            Complete the company questionnaire to generate a report.
          </p>
          <Link
            href="/analyze"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Start analysis
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <FinalReportView result={result} />
      </div>
    </main>
  );
}
