"use client";

import {
  COMPANY_QUESTIONS,
  EMPTY_COMPANY_PROFILE,
  parseMultiValue,
  toggleMultiValue,
  type CompanyProfile,
  type QuestionDefinition,
} from "@/lib/company/questionnaire";
import { AnalysisLoader } from "@/components/analyze/AnalysisLoader";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STORAGE_KEY = "solicitations-analysis-result";

function noneOptionFor(question: QuestionDefinition): string | undefined {
  return question.options?.find((o) => o.startsWith("None"));
}

function fieldIsEmpty(profile: CompanyProfile, question: QuestionDefinition): boolean {
  const value = profile[question.id];
  if (question.type === "multiselect") {
    return parseMultiValue(value).length === 0;
  }
  return !value?.trim();
}

function MultiSelectField({
  question,
  value,
  onChange,
}: {
  question: QuestionDefinition;
  value: string;
  onChange: (next: string) => void;
}) {
  const selected = new Set(parseMultiValue(value));
  const noneOption = noneOptionFor(question);

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby={question.id}>
      {question.options?.map((option) => {
        const isSelected = selected.has(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(toggleMultiValue(value, option, noneOption))}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
              isSelected
                ? "border-blue-500 bg-blue-500/15 text-blue-200 ring-2 ring-blue-500/25"
                : "border-slate-600 bg-slate-800/60 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800"
            }`}
            aria-pressed={isSelected}
          >
            <span className="mr-2 inline-block w-4">{isSelected ? "✓" : ""}</span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function QuestionnaireForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY_COMPANY_PROFILE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = COMPANY_QUESTIONS[step];
  const isLast = step === COMPANY_QUESTIONS.length - 1;

  if (!question) {
    return (
      <div className="card-elevated p-8 text-red-600">
        Something went wrong loading the questionnaire. Please refresh the page.
      </div>
    );
  }

  function updateField(value: string) {
    setProfile((prev) => ({ ...prev, [question.id]: value }));
  }

  function validateCurrentStep(): boolean {
    if (question.required && fieldIsEmpty(profile, question)) {
      setError(
        question.type === "multiselect"
          ? `Please select at least one option for: ${question.label}`
          : `Please answer: ${question.label}`,
      );
      return false;
    }
    setError(null);
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    if (!isLast) setStep((s) => s + 1);
  }

  function goBack() {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError(null);

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
    }
  }

  return (
    <>
      <AnalysisLoader active={loading} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="card-elevated"
        noValidate
      >
        <div className="mb-6 flex items-center justify-between text-sm font-medium text-slate-400">
          <span>
            Question {step + 1} of {COMPANY_QUESTIONS.length}
          </span>
          <span>{Math.round(((step + 1) / COMPANY_QUESTIONS.length) * 100)}%</span>
        </div>
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((step + 1) / COMPANY_QUESTIONS.length) * 100}%` }}
          />
        </div>

        <label htmlFor={question.id} className="mt-8 block text-xl font-bold text-slate-50">
          {question.label}
          {question.required && <span className="text-red-600"> *</span>}
        </label>
        <div className="mt-4 space-y-3 rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">Why we ask</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{question.whyWeAsk}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">How to answer</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{question.howToAnswer}</p>
          </div>
          {question.placeholder && question.type !== "select" && question.type !== "multiselect" && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Example</p>
              <p className="mt-1 text-sm italic leading-relaxed text-slate-500">{question.placeholder}</p>
            </div>
          )}
        </div>

        {question.type === "multiselect" ? (
          <MultiSelectField
            question={question}
            value={profile[question.id]}
            onChange={updateField}
          />
        ) : question.type === "select" ? (
          <select
            id={question.id}
            value={profile[question.id]}
            onChange={(e) => updateField(e.target.value)}
            className="input-field mt-4"
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
            placeholder="Type your answer here…"
            className="input-field mt-4"
          />
        ) : (
          <input
            id={question.id}
            type="text"
            value={profile[question.id]}
            onChange={(e) => updateField(e.target.value)}
            placeholder={question.placeholder}
            className="input-field mt-4"
          />
        )}

        {question.type === "multiselect" && parseMultiValue(profile[question.id]).length > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            Selected: {parseMultiValue(profile[question.id]).join(", ")}
          </p>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-10 flex justify-between border-t border-slate-700/60 pt-8">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0 || loading}
            className="btn-secondary !px-5 !py-2.5 disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (isLast) void handleSubmit();
              else goNext();
            }}
            className="btn-primary !px-6 !py-2.5 disabled:opacity-60"
          >
            {loading ? "Analyzing…" : isLast ? "Generate report" : "Next"}
          </button>
        </div>
      </form>
    </>
  );
}

export { STORAGE_KEY };
