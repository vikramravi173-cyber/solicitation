"use client";

import type { CompanyProfile } from "@/lib/company/questionnaire";
import type { AnalyzedOpportunity } from "@/lib/domain/types";
import { useEffect } from "react";
import { OnePageGrantReport } from "./OnePageGrantReport";

interface GrantReportModalProps {
  rank: number;
  opportunity: AnalyzedOpportunity;
  company: CompanyProfile;
  onClose: () => void;
}

export function GrantReportModal({ rank, opportunity, company, onClose }: GrantReportModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <button
        type="button"
        aria-label="Close report"
        className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="grant-report-title"
        className="relative z-10 my-auto w-full max-w-3xl"
      >
        <div className="card-elevated !p-0">
          <div className="no-print flex items-center justify-between gap-4 border-b border-slate-700/60 px-6 py-4 sm:px-8">
            <p id="grant-report-title" className="text-sm font-semibold text-slate-200">
              One-page grant report
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary !px-4 !py-2 text-xs"
              >
                Print
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary !px-4 !py-2 text-xs"
              >
                Close
              </button>
            </div>
          </div>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
            <OnePageGrantReport
              rank={rank}
              opportunity={opportunity}
              company={company}
              acceptance={opportunity.acceptance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
