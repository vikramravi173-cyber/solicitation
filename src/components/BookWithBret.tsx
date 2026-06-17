import { BRET_MEETING_OPTIONS } from "@/lib/booking/bret-meetings";

export function BookWithBret() {
  return (
    <div className="panel shadow-panel">
      <div className="border-b border-line p-5 sm:p-6">
        <div className="eyebrow">Book with Bret</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-mist">
          Talk through your next opportunity
        </h2>
        <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-muted">
          Schedule time with Bret to discuss your search results, company fit, or federal pursuit
          strategy. Pick the session that fits where you are in the process.
        </p>
      </div>

      <ul className="divide-y divide-line">
        {BRET_MEETING_OPTIONS.map((option) => {
          const configured = option.href !== "#";

          return (
            <li
              key={option.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-mist">{option.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {option.description}
                  {option.meta ? ` · ${option.meta}` : ""}
                </p>
              </div>
              <div className="shrink-0">
                {configured ? (
                  <a
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !px-4 !py-2 text-[12px]"
                  >
                    Book meeting →
                  </a>
                ) : (
                  <span className="font-mono text-[12px] text-faint">Link coming soon</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
