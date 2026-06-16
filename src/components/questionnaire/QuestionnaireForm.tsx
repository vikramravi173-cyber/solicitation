"use client";

import {
  COMPANY_QUESTIONS,
  EMPTY_COMPANY_PROFILE,
  type CompanyProfile,
} from "@/lib/company/questionnaire";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STORAGE_KEY = "solicitations-analysis-result";

export function QuestionnaireForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY_COMPANY_PROFILE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const question = COMPANY_QUESTIONS[step];
  const isLast = step === COMPANY_QUESTIONS.length - 1;

  function updateField(value: string) {
    setProfile((prev) => ({ ...prev, [question.id]: value }));
  }

  function goNext() {
    if (question.required && !profile[question.id]?.trim()) {
      setError(`Please answer: ${question.label}`);
      return;
    }
    setError(null);
    if (!isLast) setStep((s) => s + 1);
  }

  function goBack() {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (question.required && !profile[question.id]?.trim()) {
      setError(`Please answer: ${question.label}`);
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Loading solicitations and running analysis…");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      router.push("/report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <form
      onSubmit={isLast ? handleSubmit : (e) => { e.preventDefault(); goNext(); }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
        <span>
          Question {step + 1} of {COMPANY_QUESTIONS.length}
        </span>
        <span>{Math.round(((step + 1) / COMPANY_QUESTIONS.length) * 100)}%</span>
      </div>
      <div className="mb-2 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{ width: `${((step + 1) / COMPANY_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <label htmlFor={question.id} className="mt-6 block text-lg font-semibold text-slate-900">
        {question.label}
        {question.required && <span className="text-red-500"> *</span>}
      </label>
      <p className="mt-1 text-sm text-slate-600">{question.description}</p>

      {question.type === "select" ? (
        <select
          id={question.id}
          value={profile[question.id]}
          onChange={(e) => updateField(e.target.value)}
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Select…</option>
          {question.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : question.type === "textarea" ? (
        <textarea
          id={question.id}
          rows={5}
          value={profile[question.id]}
          onChange={(e) => updateField(e.target.value)}
          placeholder={question.placeholder}
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      ) : (
        <input
          id={question.id}
          type="text"
          value={profile[question.id]}
          onChange={(e) => updateField(e.target.value)}
          placeholder={question.placeholder}
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {status && <p className="mt-4 text-sm text-blue-700">{status}</p>}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0 || loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Analyzing…" : isLast ? "Generate report" : "Next"}
        </button>
      </div>
    </form>
  );
}

export { STORAGE_KEY };
