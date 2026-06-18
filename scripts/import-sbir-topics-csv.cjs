/**
 * Merges SBIR.gov topics CSV export into data/solicitations.json
 * Run: npm run import-sbir-topics
 */
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const ROOT = join(__dirname, "..");
const CSV_PATH = join(ROOT, "data/sbir-topics.csv");
const OUTPUT_PATH = join(ROOT, "data/solicitations.json");

const COMPANIES = [
  "Optical Gate",
  "OTEC",
  "Ingenium",
  "Swift Solar",
  "OMC Thermochemistry",
  "MXene Inc",
];

function emptyFlags() {
  return Object.fromEntries(COMPANIES.map((c) => [c, false]));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || (c === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      if (c === "\r") i++;
    } else {
      field += c;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

function formatDueDate(value) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${Number(m)}/${Number(d)}/${y.slice(-2)}`;
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
  }

  return trimmed;
}

function mapBranch(branch) {
  const b = branch.trim().toUpperCase();
  if (b === "NAVY") return "Navy";
  if (b === "USAF" || b === "AIR FORCE") return "Air Force";
  if (b === "ARMY") return "Army";
  if (b === "SOCOM") return "SOCOM";
  if (b === "SPACE FORCE") return "Space Force";
  if (b === "NASA") return "NASA";
  return "OSD";
}

function rowFromTopic(record, rowIndex) {
  const program = record.Program?.trim() || "SBIR";
  const phase = record.Phase?.trim();
  const branch = record.Branch?.trim() ?? "";
  const agency = record.Agency?.trim() ?? "";

  const keywords = [
    program,
    branch,
    record["Solicitation Status"]?.trim(),
    record["Solicitation Year"]?.trim(),
  ]
    .filter(Boolean)
    .join("; ");

  return {
    rowIndex,
    department: mapBranch(branch),
    companyFlags: emptyFlags(),
    dueDate: formatDueDate(record["Close Date"]),
    title: record["Topic Title"]?.trim() ?? "",
    solicitationNumber: record["Topic Number"]?.trim() ?? "",
    description: record["Topic Description"]?.trim() ?? "",
    organization: branch && agency ? `${agency} / ${branch}` : branch || agency,
    solicitationType: phase ? `${program} (${phase})` : program,
    keyWords: keywords,
    applicants: "Small business",
    link:
      record.SBIRTopicLink?.trim() ||
      record["Solicitation Agency URL"]?.trim() ||
      "",
  };
}

function main() {
  const csvText = readFileSync(CSV_PATH, "utf8");
  const table = parseCsv(csvText);
  const headers = table[0];
  const records = table.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""])),
  );

  const existingDb = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
  const existing = existingDb.solicitations ?? [];
  const existingNumbers = new Set(
    existing.map((row) => row.solicitationNumber?.trim()).filter(Boolean),
  );

  let nextIndex =
    existing.reduce((max, row) => Math.max(max, row.rowIndex ?? 0), 0) + 1;

  const added = [];
  let skipped = 0;

  for (const record of records) {
    const number = record["Topic Number"]?.trim();
    if (number && existingNumbers.has(number)) {
      skipped++;
      continue;
    }

    const row = rowFromTopic(record, nextIndex++);
    if (!row.title) continue;

    added.push(row);
    if (number) existingNumbers.add(number);
  }

  const merged = [...existing, ...added];
  const output = {
    source: `${existingDb.source} + data/sbir-topics.csv`,
    parsedAt: new Date().toISOString(),
    count: merged.length,
    solicitations: merged,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(
    `Imported ${added.length} SBIR topics (${skipped} duplicates skipped) → ${merged.length} total in ${OUTPUT_PATH}`,
  );
}

main();
