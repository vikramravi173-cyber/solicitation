import { useMemo, useState } from "react";
import type { SolicitationRow } from "@/lib/solicitations/types";
import { resolveDisplayTitle } from "@/lib/solicitations/display-title";
import { solicitationSearchCorpus } from "@/lib/matching/match-solicitations";
import { textMatchScore } from "@/lib/matching/text-utils";
import { field, meaningful } from "@/lib/ui/format";

type SortKey = "department" | "title" | "type" | "due";
type Dir = "asc" | "desc";

interface RegistryProps {
  rows: SolicitationRow[];
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (row: SolicitationRow) => void;
  selectedIndex?: number;
}

const DEPARTMENTS = ["Navy", "NASA", "Air Force", "Army", "OSD", "SOCOM", "Space Force", "DOE"];

function dueValue(due: string): number {
  if (!meaningful(due)) return Number.POSITIVE_INFINITY;
  const t = Date.parse(due);
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

export function Registry({
  rows,
  query,
  onQueryChange,
  onSelect,
  selectedIndex,
}: RegistryProps) {
  const [dept, setDept] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: Dir }>({
    key: "due",
    dir: "asc",
  });

  const filtered = useMemo(() => {
    const q = query.trim();
    let out = rows.filter((r) => {
      if (dept && !r.department.toLowerCase().includes(dept.toLowerCase())) return false;
      if (!q) return true;
      return textMatchScore(q, solicitationSearchCorpus(r)) >= 0.15;
    });

    out = [...out].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "department":
          return a.department.localeCompare(b.department) * dir;
        case "title":
          return resolveDisplayTitle(a).localeCompare(resolveDisplayTitle(b)) * dir;
        case "type":
          return a.solicitationType.localeCompare(b.solicitationType) * dir;
        case "due":
          return (dueValue(a.dueDate) - dueValue(b.dueDate)) * dir;
      }
    });
    return out;
  }, [rows, query, dept, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  return (
    <div className="panel shadow-panel">
      {/* Controls */}
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-faint">
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Filter by topic, agency, typo-tolerant…"
            className="field pl-9"
            aria-label="Filter the catalog"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip active={dept === null} onClick={() => setDept(null)}>
            All
          </FilterChip>
          {DEPARTMENTS.map((d) => (
            <FilterChip key={d} active={dept === d} onClick={() => setDept(d)}>
              {d}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-eyebrow text-faint">
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </span>
        <span className="font-mono text-[11px] text-faint">click a row → brief</span>
      </div>

      {/* Table */}
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-panel-2">
            <tr className="border-b border-line">
              <Th onClick={() => toggleSort("department")} sort={sort} col="department" className="w-[120px]">
                Agency
              </Th>
              <Th onClick={() => toggleSort("title")} sort={sort} col="title">
                Solicitation
              </Th>
              <Th onClick={() => toggleSort("type")} sort={sort} col="type" className="w-[120px] hidden md:table-cell">
                Type
              </Th>
              <Th onClick={() => toggleSort("due")} sort={sort} col="due" className="w-[110px]">
                Due
              </Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const active = selectedIndex === r.rowIndex;
              return (
                <tr
                  key={r.rowIndex}
                  onClick={() => onSelect(r)}
                  className={`group cursor-pointer border-b border-line/60 transition-colors ${
                    active ? "bg-brass/10" : "hover:bg-panel-2"
                  }`}
                >
                  <td className="px-4 py-2.5 align-top">
                    <span className="font-mono text-[11px] uppercase tracking-wide text-brass/90">
                      {r.department}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <div className="flex items-start gap-2">
                      <span className="line-clamp-2 text-[14px] leading-snug text-mist group-hover:text-white">
                        {resolveDisplayTitle(r)}
                      </span>
                      {meaningful(r.link) && (
                        <span title="Has official link" className="mt-0.5 text-teal">
                          ↗
                        </span>
                      )}
                    </div>
                    {meaningful(r.keyWords) && (
                      <div className="mt-0.5 line-clamp-1 font-mono text-[10.5px] text-faint">
                        {r.keyWords}
                      </div>
                    )}
                  </td>
                  <td className="hidden px-4 py-2.5 align-top md:table-cell">
                    <span className="font-mono text-[11px] text-muted">
                      {field(r.solicitationType)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <span className="tabular font-mono text-[12px] text-mist">
                      {field(r.dueDate)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center">
                  <p className="text-muted">No solicitations match those filters.</p>
                  <p className="mt-1 font-mono text-[12px] text-faint">
                    Try a broader term or clear the agency filter.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[11px] px-2.5 py-1 border transition-colors ${
        active
          ? "border-brass/60 bg-brass/15 text-brass"
          : "border-line text-muted hover:border-line-bright hover:text-mist"
      }`}
    >
      {children}
    </button>
  );
}

function Th({
  children,
  onClick,
  sort,
  col,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  sort: { key: SortKey; dir: Dir };
  col: SortKey;
  className?: string;
}) {
  const active = sort.key === col;
  return (
    <th className={`px-4 py-2.5 ${className}`}>
      <button
        onClick={onClick}
        className={`flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-eyebrow transition-colors ${
          active ? "text-brass" : "text-faint hover:text-mist"
        }`}
      >
        {children}
        <span className="text-[9px]">{active ? (sort.dir === "asc" ? "▲" : "▼") : "⇅"}</span>
      </button>
    </th>
  );
}
