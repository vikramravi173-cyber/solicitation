import { useLobby } from "@/lib/lobby/context";
import type { CongressionalMember, ContactLogEntry, FormFieldDraft } from "@/lib/lobby/types";

export function CongressionalTracker() {
  const { campaign, updateCampaign } = useLobby();

  function updateEntity(field: keyof typeof campaign.entity, value: string) {
    updateCampaign((prev) => ({
      ...prev,
      entity: { ...prev.entity, [field]: value },
    }));
  }

  function updateBudget(field: keyof typeof campaign.budget, value: string) {
    updateCampaign((prev) => ({
      ...prev,
      budget: { ...prev.budget, [field]: value },
    }));
  }

  function updateRegion(index: number, field: "region" | "talkingPoints", value: string) {
    updateCampaign((prev) => {
      const regions = [...prev.regions];
      regions[index] = { ...regions[index], [field]: value };
      return { ...prev, regions };
    });
  }

  function addMember(chamber: "house" | "senate") {
    const member: CongressionalMember = {
      id: crypto.randomUUID(),
      chamber,
      name: "",
      districtOrState: "",
      deadline: "",
      submitted: false,
      committees: "",
      formUrl: "",
      instructions: "",
      formFields: [],
      contactLog: [],
    };
    updateCampaign((prev) =>
      chamber === "house"
        ? { ...prev, houseMembers: [...prev.houseMembers, member] }
        : { ...prev, senateMembers: [...prev.senateMembers, member] },
    );
  }

  return (
    <div className="space-y-8">
      <div className="panel p-5 sm:p-6">
        <div className="eyebrow-muted">Team instructions</div>
        <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted">
          <li>
            <strong className="text-mist">Status tracking:</strong> Mark members submitted once
            portal entry is confirmed.
          </li>
          <li>
            <strong className="text-mist">Drafting:</strong> Use form fields under each member —
            finalize here before copying into the portal.
          </li>
          <li>
            <strong className="text-mist">Last contact:</strong> Log all outreach with dates and
            staffer names.
          </li>
        </ul>
      </div>

      <Section title="Campaign" eyebrow="Header">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Campaign name">
            <input
              className="field"
              value={campaign.name}
              onChange={(e) => updateCampaign({ name: e.target.value })}
            />
          </Field>
          <Field label="Fiscal year">
            <input
              className="field"
              value={campaign.fiscalYear}
              onChange={(e) => updateCampaign({ fiscalYear: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      <Section title="Common data" eyebrow="Entity & contact">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Legal entity name">
            <input
              className="field"
              value={campaign.entity.legalEntityName}
              onChange={(e) => updateEntity("legalEntityName", e.target.value)}
            />
          </Field>
          <Field label="Primary POC">
            <input
              className="field"
              value={campaign.entity.primaryPoc}
              onChange={(e) => updateEntity("primaryPoc", e.target.value)}
            />
          </Field>
          <Field label="Partner org">
            <input
              className="field"
              value={campaign.entity.partnerOrg}
              onChange={(e) => updateEntity("partnerOrg", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Budget & technical details" eyebrow="FY 2026 & FY 2027">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["projectTitle", "Project title"],
              ["agencyComponent", "Agency / component"],
              ["budgetLineFy27", "Budget line (FY27)"],
              ["programElement", "Program element (PE)"],
              ["pb2026Request", "PB 2026 request"],
              ["fy27RequestAmt", "FY27 request amount"],
              ["dodProgramMgr", "DOD program manager"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                className="field"
                value={campaign.budget[key]}
                onChange={(e) => updateBudget(key, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Regional justification" eyebrow="Talking points">
        <div className="space-y-4">
          {campaign.regions.map((r, i) => (
            <div key={i} className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <Field label={`Region ${i + 1}`}>
                <input
                  className="field"
                  value={r.region}
                  onChange={(e) => updateRegion(i, "region", e.target.value)}
                  placeholder={i === 0 ? "e.g. CO-02" : "Optional"}
                />
              </Field>
              <Field label="Key talking points">
                <textarea
                  className="field min-h-[80px]"
                  value={r.talkingPoints}
                  onChange={(e) => updateRegion(i, "talkingPoints", e.target.value)}
                  placeholder="Jobs, suppliers, facility investment, warfighter tie-in…"
                />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      <ChamberSection
        title="House"
        members={campaign.houseMembers}
        onAdd={() => addMember("house")}
        onUpdate={(members) => updateCampaign({ houseMembers: members })}
        districtLabel="Congressional district"
        districtPlaceholder="e.g. CO-02"
      />

      <ChamberSection
        title="Senate"
        members={campaign.senateMembers}
        onAdd={() => addMember("senate")}
        onUpdate={(members) => updateCampaign({ senateMembers: members })}
        districtLabel="State"
        districtPlaceholder="e.g. Colorado"
      />
    </div>
  );
}

function ChamberSection({
  title,
  members,
  onAdd,
  onUpdate,
  districtLabel,
  districtPlaceholder,
}: {
  title: string;
  members: CongressionalMember[];
  onAdd: () => void;
  onUpdate: (members: CongressionalMember[]) => void;
  districtLabel: string;
  districtPlaceholder: string;
}) {
  const submitted = members.filter((m) => m.submitted).length;

  function updateMember(id: string, patch: Partial<CongressionalMember>) {
    onUpdate(members.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeMember(id: string) {
    onUpdate(members.filter((m) => m.id !== id));
  }

  return (
    <Section
      title={title}
      eyebrow={`${submitted}/${members.length} submitted`}
      action={
        <button type="button" onClick={onAdd} className="btn-ghost !py-2 !px-3 text-[12px]">
          + Add member
        </button>
      }
    >
      {members.length === 0 ? (
        <p className="text-[13px] text-faint">
          No {title.toLowerCase()} targets yet. Add a member to begin drafting and tracking.
        </p>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              districtLabel={districtLabel}
              districtPlaceholder={districtPlaceholder}
              onUpdate={(patch) => updateMember(member.id, patch)}
              onRemove={() => removeMember(member.id)}
            />
          ))}
        </div>
      )}
    </Section>
  );
}

function MemberCard({
  member,
  districtLabel,
  districtPlaceholder,
  onUpdate,
  onRemove,
}: {
  member: CongressionalMember;
  districtLabel: string;
  districtPlaceholder: string;
  onUpdate: (patch: Partial<CongressionalMember>) => void;
  onRemove: () => void;
}) {
  function addContactEntry() {
    const entry: ContactLogEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      note: "",
      stafferName: "",
    };
    onUpdate({ contactLog: [...member.contactLog, entry] });
  }

  function addFormField() {
    const field: FormFieldDraft = {
      id: crypto.randomUUID(),
      question: "",
      response: "",
    };
    onUpdate({ formFields: [...member.formFields, field] });
  }

  return (
    <div className="border border-line bg-panel-2 p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <label className="flex cursor-pointer items-center gap-2 pt-1">
          <input
            type="checkbox"
            checked={member.submitted}
            onChange={(e) => onUpdate({ submitted: e.target.checked })}
            className="h-4 w-4 accent-brass"
          />
          <span className="font-mono text-[11px] uppercase tracking-eyebrow text-faint">
            Submitted
          </span>
        </label>
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <input
            className="field"
            placeholder="Member name"
            value={member.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
          <input
            className="field"
            placeholder={districtPlaceholder}
            aria-label={districtLabel}
            value={member.districtOrState}
            onChange={(e) => onUpdate({ districtOrState: e.target.value })}
          />
        </div>
        <input
          className="field w-full sm:w-40"
          type="date"
          aria-label="Deadline"
          value={member.deadline}
          onChange={(e) => onUpdate({ deadline: e.target.value })}
        />
        <button type="button" onClick={onRemove} className="btn-quiet text-[12px] text-fit-low">
          Remove
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Relevant committees">
          <input
            className="field"
            value={member.committees}
            onChange={(e) => onUpdate({ committees: e.target.value })}
            placeholder="HASC, Appropriations…"
          />
        </Field>
        <Field label="Form URL">
          <input
            className="field"
            value={member.formUrl}
            onChange={(e) => onUpdate({ formUrl: e.target.value })}
            placeholder="https://…"
          />
        </Field>
      </div>

      <Field label="Instructions">
        <textarea
          className="field min-h-[60px]"
          value={member.instructions}
          onChange={(e) => onUpdate({ instructions: e.target.value })}
        />
      </Field>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-eyebrow text-faint">
            Last contact
          </span>
          <button type="button" onClick={addContactEntry} className="btn-quiet text-[12px]">
            + Log contact
          </button>
        </div>
        {member.contactLog.length === 0 ? (
          <p className="text-[12px] text-faint">No outreach logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {member.contactLog.map((entry) => (
              <li key={entry.id} className="flex flex-wrap gap-2">
                <input
                  type="date"
                  className="field w-36 !py-2 text-[13px]"
                  value={entry.date}
                  onChange={(e) =>
                    onUpdate({
                      contactLog: member.contactLog.map((c) =>
                        c.id === entry.id ? { ...c, date: e.target.value } : c,
                      ),
                    })
                  }
                />
                <input
                  className="field w-32 !py-2 text-[13px]"
                  placeholder="Staffer"
                  value={entry.stafferName ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      contactLog: member.contactLog.map((c) =>
                        c.id === entry.id ? { ...c, stafferName: e.target.value } : c,
                      ),
                    })
                  }
                />
                <input
                  className="field min-w-0 flex-1 !py-2 text-[13px]"
                  placeholder="Note (email sent, meeting held…)"
                  value={entry.note}
                  onChange={(e) =>
                    onUpdate({
                      contactLog: member.contactLog.map((c) =>
                        c.id === entry.id ? { ...c, note: e.target.value } : c,
                      ),
                    })
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-eyebrow text-faint">
            Form fields
          </span>
          <button type="button" onClick={addFormField} className="btn-quiet text-[12px]">
            + Add field
          </button>
        </div>
        {member.formFields.length === 0 ? (
          <p className="text-[12px] text-faint">Draft portal responses here before submitting.</p>
        ) : (
          <div className="space-y-2">
            {member.formFields.map((field) => (
              <div key={field.id} className="grid gap-2 sm:grid-cols-2">
                <input
                  className="field !py-2 text-[13px]"
                  placeholder="Question / field name"
                  value={field.question}
                  onChange={(e) =>
                    onUpdate({
                      formFields: member.formFields.map((f) =>
                        f.id === field.id ? { ...f, question: e.target.value } : f,
                      ),
                    })
                  }
                />
                <textarea
                  className="field min-h-[60px] !py-2 text-[13px]"
                  placeholder="Draft response / data"
                  value={field.response}
                  onChange={(e) =>
                    onUpdate({
                      formFields: member.formFields.map((f) =>
                        f.id === field.id ? { ...f, response: e.target.value } : f,
                      ),
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
        <div>
          {eyebrow && <div className="eyebrow-muted">{eyebrow}</div>}
          <h3 className="mt-1 font-display text-lg font-bold text-mist">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-eyebrow text-faint">
        {label}
      </span>
      {children}
    </label>
  );
}
