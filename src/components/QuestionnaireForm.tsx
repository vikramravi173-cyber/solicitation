import { useMemo, useState } from "react";
import {
  COMPANY_QUESTIONS,
  EMPTY_COMPANY_PROFILE,
  parseMultiValue,
  toggleMultiValue,
  type CompanyProfile,
  type QuestionDefinition,
} from "@/lib/company/questionnaire";

const SECTIONS: { title: string; hint: string; ids: (keyof CompanyProfile)[] }[] = [
  {
    title: "Company identity",
    hint: "Who you are on proposals and in outreach.",
    ids: ["companyName"],
  },
  {
    title: "Capabilities",
    hint: "What you build, what you can deliver, and how competitive you are.",
    ids: [
      "technologyAreas",
      "capabilities",
      "productsAndServices",
      "technologyReadinessLevel",
      "differentiators",
    ],
  },
  {
    title: "Federal track record",
    hint: "Past performance and funding shape what you can credibly pursue.",
    ids: [
      "federalExperienceLevel",
      "federalExperienceDetails",
      "sbirSttrHistory",
      "governmentFundingSources",
      "privateFundingSources",
      "fundingDetails",
    ],
  },
  {
    title: "Targets & context",
    hint: "Where you want to compete, eligibility, and anything else that affects fit.",
    ids: ["teamSize", "targetDepartments", "businessStatus", "additionalContext"],
  },
];

const Q_BY_ID = new Map(COMPANY_QUESTIONS.map((q) => [q.id, q]));

export function QuestionnaireForm({
  onSubmit,
  busy,
}: {
  onSubmit: (profile: CompanyProfile) => void;
  busy: boolean;
}) {
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY_COMPANY_PROFILE);
  const [touched, setTouched] = useState(false);
  const [expandedWhy, setExpandedWhy] = useState<Partial<Record<keyof CompanyProfile, boolean>>>(
    {},
  );

  const requiredIds = useMemo(
    () => COMPANY_QUESTIONS.filter((q) => q.required).map((q) => q.id),
    [],
  );
  const missing = requiredIds.filter((id) => !profile[id].trim());
  const completed = requiredIds.length - missing.length;

  function set(id: keyof CompanyProfile, value: string) {
    setProfile((p) => ({ ...p, [id]: value }));
  }

  function toggleWhy(id: keyof CompanyProfile) {
    setExpandedWhy((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (missing.length > 0) {
      document
        .getElementById(`q-${missing[0]}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSubmit(profile);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      <div className="space-y-12">
        {SECTIONS.map((section, si) => (
          <fieldset key={section.title} className="border-t border-line pt-6">
            <legend className="flex items-baseline gap-3">
              <span className="font-mono text-[13px] font-semibold tabular text-brass-dim">
                {String(si + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-xl font-bold text-mist">{section.title}</span>
            </legend>
            <p className="mb-6 ml-9 text-[13px] text-faint">{section.hint}</p>

            <div className="space-y-7">
              {section.ids.map((id) => {
                const q = Q_BY_ID.get(id)!;
                const showError = touched && q.required && !profile[id].trim();
                const whyOpen = expandedWhy[id];
                return (
                  <div key={id} id={`q-${id}`} className="ml-9 scroll-mt-24">
                    <div className="flex items-baseline justify-between gap-3">
                      <label htmlFor={id} className="text-[15px] font-medium text-mist">
                        {q.label}
                        {q.required && <span className="text-brass"> *</span>}
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleWhy(id)}
                        className="shrink-0 font-mono text-[11px] text-faint transition-colors hover:text-brass"
                      >
                        {whyOpen ? "Hide why" : "Why we ask"}
                      </button>
                    </div>
                    {whyOpen && (
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{q.whyWeAsk}</p>
                    )}
                    <p className="mt-1 text-[12.5px] leading-snug text-faint">{q.howToAnswer}</p>
                    <div className="mt-2.5">
                      <Field q={q} value={profile[id]} onChange={(v) => set(id, v)} />
                    </div>
                    {showError && (
                      <p className="mt-1.5 font-mono text-[11px] text-fit-low">
                        Required to score your fit.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[12px] text-faint">
          {completed} / {requiredIds.length} required answered · optional fields sharpen the dossier
        </p>
        <div className="flex flex-col items-end gap-1.5">
          <button type="submit" disabled={busy} className="btn-primary py-3">
            {busy ? "Scoring…" : "Generate dossier →"}
          </button>
          {touched && missing.length > 0 && (
            <p className="font-mono text-[11px] text-fit-low">
              {missing.length} required {missing.length === 1 ? "answer" : "answers"} left
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({
  q,
  value,
  onChange,
}: {
  q: QuestionDefinition;
  value: string;
  onChange: (v: string) => void;
}) {
  if (q.type === "textarea") {
    return (
      <textarea
        id={q.id}
        className="field"
        placeholder={q.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (q.type === "select") {
    return (
      <div className="flex flex-wrap gap-2">
        {q.options?.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? "" : opt)}
              className={`border px-3 py-2 text-left text-[13px] transition-colors ${
                active
                  ? "border-brass/60 bg-brass/15 text-brass"
                  : "border-line text-muted hover:border-line-bright hover:text-mist"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (q.type === "multiselect") {
    const selected = new Set(parseMultiValue(value));
    const noneOption = q.options?.find((o) => o.toLowerCase().startsWith("none"));
    return (
      <div className="flex flex-wrap gap-2">
        {q.options?.map((opt) => {
          const active = selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(toggleMultiValue(value, opt, noneOption))}
              className={`flex items-center gap-2 border px-3 py-2 text-[13px] transition-colors ${
                active
                  ? "border-teal/60 bg-teal/15 text-teal"
                  : "border-line text-muted hover:border-line-bright hover:text-mist"
              }`}
            >
              <span className="font-mono text-[11px]">{active ? "✓" : "+"}</span>
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <input
      id={q.id}
      className="field"
      placeholder={q.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
