import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SolicitationRow } from "@/lib/solicitations/types";
import { resolveDisplayTitle } from "@/lib/solicitations/display-title";
import { getOrBuildProfile } from "@/lib/data/solicitation-profiles-store";
import type { SolicitationProfile } from "@/lib/reporting/build-solicitation-profile";
import { runKeywordOpportunityAnalysis } from "@/lib/pipeline/analyze";
import { storeAnalysis } from "@/state/analysis";
import { SummaryContent } from "@/components/report/SummaryContent";
import { field, meaningful } from "@/lib/ui/format";

export function OpportunityDrawer({
  row,
  onClose,
}: {
  row: SolicitationRow | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [building, setBuilding] = useState(false);
  const [profile, setProfile] = useState<SolicitationProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (row) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [row, onClose]);

  useEffect(() => {
    if (!row) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    setLoadingProfile(true);
    getOrBuildProfile(row)
      .then((built) => {
        if (!cancelled) setProfile(built);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [row]);

  if (!row) return null;

  const title = resolveDisplayTitle(row);
  const query = meaningful(row.keyWords) ? row.keyWords : title;

  async function buildDossier() {
    if (!row) return;
    setBuilding(true);
    try {
      const result = await runKeywordOpportunityAnalysis(query, row.rowIndex);
      storeAnalysis(result);
      navigate("/report");
    } catch {
      setBuilding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end no-print">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
      />
      <aside className="relative flex h-full w-full max-w-xl animate-drawer-in flex-col border-l border-line bg-panel shadow-drawer">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <div className="eyebrow">{row.department}</div>
            <h2 className="mt-2 font-display text-xl font-bold leading-tight text-mist">
              {title}
            </h2>
          </div>
          <button onClick={onClose} className="btn-quiet text-lg">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5">
          <dl className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line">
            <Cell label="Type" value={field(row.solicitationType)} />
            <Cell label="Due" value={field(row.dueDate)} mono />
            <Cell label="Organization" value={field(row.organization)} />
            <Cell label="Solicitation #" value={field(row.solicitationNumber)} mono />
            <Cell label="Eligible applicants" value={field(row.applicants)} span />
          </dl>

          {meaningful(row.keyWords) && (
            <Section label="Focus areas">
              <div className="flex flex-wrap gap-1.5">
                {row.keyWords
                  .split(/[,;]+/)
                  .map((k) => k.trim())
                  .filter(Boolean)
                  .map((k, i) => (
                    <span
                      key={i}
                      className="border border-line bg-panel-2 px-2 py-0.5 font-mono text-[11px] text-muted"
                    >
                      {k}
                    </span>
                  ))}
              </div>
            </Section>
          )}

          <Section label="Catalog brief">
            {loadingProfile ? (
              <p className="text-[13px] text-faint">Generating brief…</p>
            ) : profile ? (
              <SummaryContent body={profile.synthesizedOverview} variant="panel" />
            ) : (
              <p className="text-[13px] text-faint">Brief unavailable.</p>
            )}
          </Section>

          {profile && profile.catalogGaps.length > 0 && (
            <Section label="Data confidence">
              <p className="text-[13px] leading-relaxed text-faint">
                Some catalog fields are incomplete ({profile.catalogGaps.join(", ").toLowerCase()}).
                Confirm details in the official solicitation before committing bid resources.
              </p>
            </Section>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 border-t border-line p-5">
          <button onClick={buildDossier} disabled={building} className="btn-primary flex-1">
            {building ? "Building dossier…" : "Build pursuit dossier"}
          </button>
          {meaningful(row.link) && (
            <a
              href={row.link}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              Official link ↗
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}

function Cell({
  label,
  value,
  mono,
  span,
}: {
  label: string;
  value: string;
  mono?: boolean;
  span?: boolean;
}) {
  return (
    <div className={`bg-panel p-3 ${span ? "col-span-2" : ""}`}>
      <dt className="eyebrow-muted">{label}</dt>
      <dd className={`mt-1 text-[13px] text-mist ${mono ? "font-mono tabular" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="eyebrow mb-2">{label}</h3>
      {children}
    </section>
  );
}
