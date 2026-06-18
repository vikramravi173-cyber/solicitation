import { LOBBY_RESOURCES, RESOURCE_CATEGORY_LABELS } from "@/lib/lobby/resources";
import type { LobbyResource } from "@/lib/lobby/resources";

const CATEGORY_ORDER: LobbyResource["category"][] = [
  "lookup",
  "guidance",
  "official",
  "template",
];

export function LobbyResourcesPanel() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: LOBBY_RESOURCES.filter((r) => r.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <div className="panel p-5 sm:p-6">
        <div className="eyebrow">DIY lobbying library</div>
        <h3 className="mt-2 font-display text-xl font-bold text-mist">
          Curated resources for congressional outreach
        </h3>
        <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-muted">
          Official lookup tools, budget references, and disclosure guidance to support your
          authorization campaign. All links open in a new tab.
        </p>
      </div>

      {grouped.map(({ category, items }) => (
        <section key={category} className="panel overflow-hidden">
          <div className="border-b border-line px-5 py-4 sm:px-6">
            <div className="eyebrow">{RESOURCE_CATEGORY_LABELS[category]}</div>
          </div>
          <ul className="divide-y divide-line">
            {items.map((resource) => (
              <li key={resource.id}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 p-5 transition-colors hover:bg-panel-2 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-mist group-hover:text-brass-bright">
                      {resource.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">
                      {resource.description}
                    </p>
                  </div>
                  <span className="mt-2 shrink-0 font-mono text-[12px] text-brass sm:mt-0">
                    Open →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
