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
      <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <div className="card max-w-md !p-10">
          <span className="text-4xl" role="img" aria-hidden>
            📋
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-50">No report found</h1>
          <p className="mt-3 text-slate-400">
            Search by keyword on the home page or complete the company questionnaire to generate a
            report.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/#keyword-search" className="btn-secondary">
              Key word search
            </Link>
            <Link href="/analyze" className="btn-primary">
              Start analysis
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-12 sm:py-16">
      <FinalReportView result={result} />
    </section>
  );
}
