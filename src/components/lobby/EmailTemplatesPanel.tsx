import { useMemo, useState } from "react";
import { useLobby } from "@/lib/lobby/context";
import { EMAIL_TEMPLATES, renderTemplate } from "@/lib/lobby/email-templates";

export function EmailTemplatesPanel() {
  const { campaign } = useLobby();
  const [templateId, setTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const template = EMAIL_TEMPLATES.find((t) => t.id === templateId)!;

  const campaignDefaults = useMemo(
    () => ({
      fiscalYear: campaign.fiscalYear.replace("FY", ""),
      projectTitle: campaign.budget.projectTitle,
      legalEntityName: campaign.entity.legalEntityName,
      agencyComponent: campaign.budget.agencyComponent,
      fy27RequestAmt: campaign.budget.fy27RequestAmt,
      budgetLineFy27: campaign.budget.budgetLineFy27,
      programElement: campaign.budget.programElement,
      primaryPoc: campaign.entity.primaryPoc,
      regionalImpact: campaign.regions[0]?.talkingPoints ?? "",
    }),
    [campaign],
  );

  const mergedValues = { ...campaignDefaults, ...values };
  const rendered = renderTemplate(template, mergedValues);

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="panel overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <div className="eyebrow-muted">Templates</div>
        </div>
        <ul className="divide-y divide-line">
          {EMAIL_TEMPLATES.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setTemplateId(t.id);
                  setValues({});
                }}
                className={`w-full px-4 py-3 text-left text-[14px] transition-colors ${
                  t.id === templateId
                    ? "bg-panel-2 font-semibold text-brass"
                    : "text-muted hover:bg-panel-2 hover:text-mist"
                }`}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-6">
        <div className="panel p-5 sm:p-6">
          <div className="eyebrow">Variables</div>
          <p className="mt-2 text-[13px] text-muted">
            Pre-filled from your campaign where available. Edit any field before copying.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {template.variables.map((v) => (
              <label key={v.key} className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-eyebrow text-faint">
                  {v.label}
                </span>
                <input
                  className="field !py-2 text-[14px]"
                  placeholder={v.placeholder}
                  value={mergedValues[v.key] ?? ""}
                  onChange={(e) => setValue(v.key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3 sm:px-6">
            <div className="eyebrow-muted">Preview</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyText(rendered.subject, "subject")}
                className="btn-ghost !py-1.5 !px-3 text-[12px]"
              >
                {copied === "subject" ? "Copied!" : "Copy subject"}
              </button>
              <button
                type="button"
                onClick={() => copyText(rendered.body, "body")}
                className="btn-primary !py-1.5 !px-3 text-[12px]"
              >
                {copied === "body" ? "Copied!" : "Copy body"}
              </button>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <p className="font-mono text-[12px] text-faint">Subject</p>
            <p className="mt-1 text-[15px] font-semibold text-mist">{rendered.subject}</p>
            <div className="rule my-4" />
            <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-muted">
              {rendered.body}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
