"use client";

import { AnalysisLoader } from "@/components/analyze/AnalysisLoader";
import { STORAGE_KEY } from "@/components/questionnaire/QuestionnaireForm";
import { formatDueDate } from "@/lib/reporting/format-display";
import type { KeywordSearchResult } from "@/lib/matching/match-solicitations";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function KeywordSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KeywordSearchResult[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [analyzingRow, setAnalyzingRow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, limit: 8 }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Search failed");
      }
      setResults(data.results ?? []);
      setSearchedQuery(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function openReport(result: KeywordSearchResult) {
    setAnalyzingRow(result.rowIndex);
    setError(null);

    try {
      const response = await fetch("/api/analyze/keyword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchedQuery || query.trim(), rowIndex: result.rowIndex }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Report generation failed");
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      router.push("/report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report generation failed");
      setAnalyzingRow(null);
    }
  }

  return (
    <>
      <AnalysisLoader active={analyzingRow !== null} />
      <div className="card-elevated !p-6 sm:!p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">Key word search</p>
            <h2 className="mt-1 text-xl font-bold text-slate-50 sm:text-2xl">
              Find the closest grant or solicitation
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Search the catalog by technology, agency, or topic. Open any match for a full half-page
              opportunity brief.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. hypersonics, Army SBIR, battery storage"
            className="input-field !mt-0 flex-1"
            aria-label="Keyword search"
          />
          <button type="submit" disabled={searching || !query.trim()} className="btn-primary shrink-0">
            {searching ? "Searching…" : "Search"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {searchedQuery && !searching && results.length === 0 && !error && (
          <p className="mt-4 text-sm text-slate-400">
            No matches for &ldquo;{searchedQuery}&rdquo;. Try broader terms or run the full company
            analysis.
          </p>
        )}

        {results.length > 0 && (
          <ul className="mt-6 space-y-3">
            {results.map((result) => (
              <li
                key={result.rowIndex}
                className="flex flex-col gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-100">{result.displayTitle}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {result.department}
                    {result.solicitationType ? ` · ${result.solicitationType}` : ""}
                    {result.dueDate ? ` · Due ${formatDueDate(result.dueDate)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-bold text-blue-400">{result.score}% match</span>
                  <button
                    type="button"
                    onClick={() => void openReport(result)}
                    disabled={analyzingRow !== null}
                    className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60"
                  >
                    {analyzingRow === result.rowIndex ? "Building report…" : "View report →"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
