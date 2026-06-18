import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SOLICITATIONS, CATALOG_META } from "@/data/solicitations";
import { BookWithBret } from "@/components/BookWithBret";
import { Registry } from "@/components/Registry";
import { OpportunityDrawer } from "@/components/OpportunityDrawer";
import type { SolicitationRow } from "@/lib/solicitations/types";
import { IMG } from "@/lib/ui/images";

const AGENCY_COUNT = new Set(SOLICITATIONS.map((s) => s.department)).size;
const WITH_LINK = SOLICITATIONS.filter((s) => s.link).length;

export function HomePage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SolicitationRow | null>(null);
  const registryRef = useRef<HTMLDivElement>(null);

  function focusRegistry() {
    registryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* ── Masthead ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <img
            src={IMG.masthead}
            alt=""
            className="h-full w-full object-cover duotone opacity-40"
            loading="eager"
          />
          {/* fade the photograph into the deck on every edge */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-transparent to-ink" />
          <div className="absolute inset-0 scrim-bottom" />
          <div className="absolute inset-0 deck-grid-bg opacity-30" />
        </div>

        <div className="relative mx-auto max-w-deck px-5 pb-12 pt-20 sm:pt-28">
          <div className="max-w-3xl animate-fade-up">
            <div className="eyebrow">Federal opportunity registry</div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl">
              Know which solicitations
              <br />
              are worth pursuing.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-mist/80">
              Score your company against every open federal solicitation, then walk in
              with a dossier — eligibility, funding, requirements, and a fit assessment
              you can defend.
            </p>

            {/* Triple entry: search catalog, company match, or lobby toolkit */}
            <div className="mt-8 flex flex-col gap-3">
              <div className="relative w-full sm:max-w-md">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-faint">
                  ⌕
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && focusRegistry()}
                  placeholder={`Search ${CATALOG_META.count} solicitations…`}
                  className="field pl-10 py-3 text-[15px]"
                  aria-label="Search the catalog"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/match" className="btn-primary py-3">
                  Run company match →
                </Link>
                <Link to="/lobby" className="btn-ghost py-3">
                  Open lobby toolkit →
                </Link>
              </div>
            </div>

            {/* Honest stat strip */}
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              <Stat value={String(CATALOG_META.count)} label="Solicitations indexed" />
              <Stat value={String(AGENCY_COUNT)} label="Agencies & components" />
              <Stat value={String(WITH_LINK)} label="With official links" />
              <Stat
                value={new Date(CATALOG_META.parsedAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
                label="Catalog as of"
              />
            </dl>
          </div>
        </div>
      </section>

      {/* ── Registry ─────────────────────────────────────────── */}
      <section ref={registryRef} className="mx-auto max-w-deck px-5 py-14 scroll-mt-16">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="eyebrow-muted">The catalog</div>
            <h2 className="mt-2 font-display text-2xl font-bold text-mist">
              Live solicitation registry
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-[13px] text-faint sm:block">
            Sort, filter, and open any line for a catalog brief.
          </p>
        </div>

        <Registry
          rows={SOLICITATIONS}
          query={query}
          onQueryChange={setQuery}
          onSelect={setSelected}
          selectedIndex={selected?.rowIndex}
        />
      </section>

      {/* ── Platform tools (mixed utilizations) ───────────────── */}
      <section className="border-t border-line bg-panel/40">
        <div className="mx-auto max-w-deck px-5 py-14">
          <div className="mb-8 max-w-2xl">
            <div className="eyebrow-muted">Platform tools</div>
            <h2 className="mt-2 font-display text-2xl font-bold text-mist">
              One deck, multiple pursuits
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              Search federal opportunities, score your company fit, or run a DIY congressional
              authorization campaign — same command-deck visuals throughout.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden md:grid-cols-3">
            <ToolCard
              eyebrow="Catalog"
              title="Live solicitation registry"
              isPrimary={false}
              description="Sort, filter, and open any line for a catalog brief across agencies and components."
              cta="Browse catalog ↓"
              onClick={focusRegistry}
            />
            <ToolCard
              eyebrow="Company match"
              title="Structured intake. Five ranked pursuits."
              description="Describe your technology areas, capabilities, and targets. Get printable pursuit dossiers ranked by fit."
              cta="Start company match →"
              href="/match"
              isPrimary
            />
            <ToolCard
              eyebrow="DIY lobby toolkit"
              title="Congressional authorization tracker"
              description="Draft NDAA requests, log staff outreach, and generate emails. Sign in required."
              cta="Open lobby toolkit →"
              href="/lobby"
            />
          </div>
        </div>
      </section>

      {/* ── Method + match CTA ───────────────────────────────── */}
      <section className="border-t border-line bg-panel/40">
        <div className="mx-auto grid max-w-deck gap-px overflow-hidden md:grid-cols-2">
          <div className="bg-ink p-8 sm:p-12">
            <div className="eyebrow">How the fit score works</div>
            <h2 className="mt-3 font-display text-2xl font-bold text-mist">
              A transparent score, not a black box.
            </h2>
            <ul className="mt-6 space-y-4">
              <Method
                n="01"
                head="Live catalog search"
                body="Your query is matched against each solicitation's title, focus areas, and metadata — partial terms and close spellings included."
              />
              <Method
                n="02"
                head="Agency & instrument fit"
                body="Target agencies and contract history (SBIR, STTR, BAA, prize) weight the match toward what you can credibly win."
              />
              <Method
                n="03"
                head="Estimated fit, decomposed"
                body="Each opportunity gets an estimated-fit score with stated strengths, gaps, and recommended actions — every input is visible."
              />
            </ul>
            <p className="mt-6 max-w-md text-[13px] leading-relaxed text-faint">
              Scoring is rule-based and runs entirely in your browser. It surfaces and
              ranks opportunities — it does not predict award decisions.
            </p>
          </div>

          <div className="relative flex flex-col justify-end overflow-hidden bg-panel-2 p-8 sm:p-12">
            <div className="absolute inset-0">
              <img src={IMG.launch} alt="" className="h-full w-full object-cover duotone" loading="lazy" />
              <div className="absolute inset-0 scrim-left" />
            </div>
            <div className="relative max-w-sm">
              <div className="eyebrow">Company match</div>
              <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-white">
                Structured intake. Five ranked pursuits.
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-mist/80">
                Describe your technology, experience, and targets. Get your top five
                solicitations ranked by fit, each with a printable pursuit dossier.
              </p>
              <Link to="/match" className="btn-primary mt-6 py-3">
                Start company match →
              </Link>
              <Link to="/lobby" className="btn-ghost mt-3 py-2.5">
                Or open lobby toolkit →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Book with Bret ───────────────────────────────────── */}
      <section id="book-with-bret" className="border-t border-line bg-panel/40">
        <div className="mx-auto max-w-deck px-5 py-14 scroll-mt-16">
          <BookWithBret />
        </div>
      </section>

      <OpportunityDrawer row={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="font-mono text-2xl font-semibold tabular text-brass">{value}</dd>
      <dt className="mt-1 font-mono text-[11px] uppercase tracking-eyebrow text-faint">
        {label}
      </dt>
    </div>
  );
}

function Method({ n, head, body }: { n: string; head: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="font-mono text-[13px] font-semibold tabular text-brass-dim">{n}</span>
      <div>
        <h4 className="text-[15px] font-semibold text-mist">{head}</h4>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
      </div>
    </li>
  );
}

function ToolCard({
  eyebrow,
  title,
  description,
  cta,
  href,
  onClick,
  isPrimary,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href?: string;
  onClick?: () => void;
  isPrimary?: boolean;
}) {
  const inner = (
    <>
      <div className="eyebrow">{eyebrow}</div>
      <h3 className="mt-3 font-display text-xl font-bold leading-tight text-mist">{title}</h3>
      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-muted">{description}</p>
      <span className={`mt-6 inline-flex ${isPrimary ? "btn-primary" : "btn-ghost"} py-2.5`}>
        {cta}
      </span>
    </>
  );

  const className =
    "flex h-full flex-col bg-ink p-8 transition-colors hover:bg-panel sm:p-10";

  if (href) {
    return (
      <Link to={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${className} text-left`}>
      {inner}
    </button>
  );
}
