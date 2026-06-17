import type { AnalysisResult } from "@/lib/domain/types";

const KEY = "solx.analysis";

export function storeAnalysis(result: AnalysisResult): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    /* storage unavailable — report page will show an empty state */
  }
}

export function loadAnalysis(): AnalysisResult | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AnalysisResult) : null;
  } catch {
    return null;
  }
}

export function clearAnalysis(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
