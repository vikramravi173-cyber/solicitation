import { LOBBY_RESOURCES, RESOURCE_CATEGORY_LABELS } from "@/lib/lobby/resources";

export function CongressionalOutreach() {
  return (
    <div className="space-y-6">
      <div className="panel p-5 sm:p-6">
        <div className="eyebrow">Member lookup</div>
        <h3 className="mt-2 font-display text-xl font-bold text-mist">
          Find the right congressional offices
        </h3>
        <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-muted">
          Start outreach by identifying your House representative and both senators. Use official
          lookup tools, then add each target to the Congressional Tracker with deadlines and
          committee assignments.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <LookupCard
            title="House — Find Your Representative"
            description="Search by ZIP code to find your member of Congress and their contact portal."
            href="https://www.house.gov/representatives/find-your-representative"
            cta="Open House lookup →"
          />
          <LookupCard
            title="Senate — Contact Directory"
            description="Find both senators for your state, staff directories, and official websites."
            href="https://www.senate.gov/senators/senators-contact.htm"
            cta="Open Senate directory →"
          />
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <div className="eyebrow-muted">Outreach workflow</div>
          <h3 className="mt-1 font-display text-lg font-bold text-mist">Recommended sequence</h3>
        </div>
        <ol className="divide-y divide-line">
          {[
            {
              step: "01",
              title: "Research",
              body: "Pull committee assignments from Congress.gov. Note each office's authorization form URL and deadline.",
            },
            {
              step: "02",
              title: "Draft",
              body: "Complete common data and form field drafts in the Tracker before touching any portal.",
            },
            {
              step: "03",
              title: "Initial contact",
              body: "Send a concise staff email using the Email Templates tab. Log the date and staffer name.",
            },
            {
              step: "04",
              title: "Brief & submit",
              body: "Offer a 15-minute briefing. Submit to the portal once drafts are finalized; mark submitted in the tracker.",
            },
            {
              step: "05",
              title: "Follow up",
              body: "If no response in 5–7 business days, use the follow-up template. Continue logging all touches.",
            },
          ].map((item) => (
            <li key={item.step} className="flex gap-4 p-5 sm:p-6">
              <span className="font-mono text-[13px] font-semibold tabular text-brass-dim">
                {item.step}
              </span>
              <div>
                <h4 className="text-[15px] font-semibold text-mist">{item.title}</h4>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <div className="eyebrow-muted">Quick links</div>
          <h3 className="mt-1 font-display text-lg font-bold text-mist">Official resources</h3>
        </div>
        <ul className="divide-y divide-line">
          {LOBBY_RESOURCES.filter((r) => r.category === "lookup" || r.category === "official").map(
            (resource) => (
              <li key={resource.id}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1 p-5 transition-colors hover:bg-panel-2 sm:p-6"
                >
                  <span className="text-[15px] font-semibold text-mist">{resource.title}</span>
                  <span className="text-[13px] text-muted">{resource.description}</span>
                  <span className="mt-1 font-mono text-[11px] text-brass">
                    {RESOURCE_CATEGORY_LABELS[resource.category]} →
                  </span>
                </a>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

function LookupCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="border border-line bg-panel-2 p-5">
      <h4 className="font-display text-[16px] font-bold text-mist">{title}</h4>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{description}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-4 !px-4 !py-2 text-[12px]"
      >
        {cta}
      </a>
    </div>
  );
}
