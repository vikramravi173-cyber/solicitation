/**
 * Merges grants.gov CSV export into data/solicitations.json
 * Run: npm run import-grants
 */
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const ROOT = join(__dirname, "..");
const CSV_PATH = join(ROOT, "data/grants-search.csv");
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

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function formatDueDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso?.trim() ?? "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${m}/${d}/${String(y).slice(-2)}`;
}

function formatFundingInstruments(value) {
  if (!value) return "";
  return value
    .split(";")
    .map((part) =>
      part
        .trim()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (ch) => ch.toUpperCase()),
    )
    .filter(Boolean)
    .join("; ");
}

function mapDepartment(agencyName, topLevel, agencyCode) {
  const text = `${agencyName} ${topLevel} ${agencyCode}`.toLowerCase();
  if (text.includes("nasa")) return "NASA";
  if (text.includes("army")) return "Army";
  if (text.includes("navy") || text.includes("naval")) return "Navy";
  if (text.includes("air force") || text.includes("usaf") || text.includes("daf")) return "Air Force";
  if (text.includes("space force")) return "Space Force";
  if (text.includes("socom") || text.includes("special operations")) return "SOCOM";
  if (text.includes("energy") || /\bdoe\b/.test(text)) return "DOE";
  if (text.includes("ousd") || text.includes("osd") || text.includes("defense")) return "OSD";
  if (agencyName) return agencyName.replace(/\s+Headquarters$/i, "").trim();
  return topLevel?.trim() || agencyCode?.trim() || "Federal";
}

function rowFromGrant(record, rowIndex) {
  const keywords = [record.funding_categories, record.funding_category_description]
    .filter(Boolean)
    .join("; ");

  const applicants = [record.applicant_types, record.applicant_eligibility_description]
    .filter(Boolean)
    .join(" — ");

  const description = stripHtml(record.summary_description);
  const closeNote = record.close_date_description
    ? stripHtml(record.close_date_description).slice(0, 500)
    : "";

  return {
    rowIndex,
    department: mapDepartment(
      record.agency_name,
      record.top_level_agency_name,
      record.agency_code,
    ),
    companyFlags: emptyFlags(),
    dueDate: formatDueDate(record.close_date),
    title: record.opportunity_title?.trim() ?? "",
    solicitationNumber: record.opportunity_number?.trim() ?? "",
    description: closeNote && description ? `${description} ${closeNote}` : description || closeNote,
    organization: record.agency_name?.trim() ?? "",
    solicitationType: formatFundingInstruments(record.funding_instruments),
    keyWords: keywords,
    applicants: applicants.slice(0, 500),
    link: record.additional_info_url?.trim() || record.url?.trim() || "",
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
    const number = record.opportunity_number?.trim();
    if (number && existingNumbers.has(number)) {
      skipped++;
      continue;
    }

    const row = rowFromGrant(record, nextIndex++);
    if (!row.title) continue;

    added.push(row);
    if (number) existingNumbers.add(number);
  }

  const merged = [...existing, ...added];
  const output = {
    source: `${existingDb.source} + data/grants-search.csv`,
    parsedAt: new Date().toISOString(),
    count: merged.length,
    solicitations: merged,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(
    `Imported ${added.length} grants (${skipped} duplicates skipped) → ${merged.length} total in ${OUTPUT_PATH}`,
  );
}

main();
