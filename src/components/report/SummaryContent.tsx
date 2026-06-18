import { parseBulletList } from "@/lib/reporting/format-content";

const variants = {
  paper: {
    text: "text-paper-ink/90",
    bullet: "bg-paper-muted/60",
  },
  panel: {
    text: "text-mist/90",
    bullet: "bg-muted",
  },
} as const;

export function SummaryContent({
  body,
  numbered = false,
  variant = "paper",
  className = "",
}: {
  body: string;
  numbered?: boolean;
  variant?: keyof typeof variants;
  className?: string;
}) {
  const v = variants[variant];
  const items = parseBulletList(body);
  if (items.length === 0) return null;

  const Tag = numbered ? "ol" : "ul";
  const listClass = numbered ? "mt-2 list-decimal space-y-2 pl-5" : "mt-2 space-y-2";

  if (items.length === 1 && !body.includes("\n") && !/^•\s/.test(body.trim())) {
    return (
      <p className={`text-[14px] leading-relaxed ${v.text} ${className}`}>{items[0]}</p>
    );
  }

  return (
    <Tag className={`${listClass} ${className}`}>
      {items.map((item, i) => (
        <li
          key={i}
          className={`text-[14px] leading-snug ${v.text} ${numbered ? "pl-1" : "flex gap-2.5"}`}
        >
          {!numbered && (
            <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${v.bullet}`} />
          )}
          <span className={numbered ? "" : "flex-1"}>{item}</span>
        </li>
      ))}
    </Tag>
  );
}
