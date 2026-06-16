/**
 * Parses data/Gov_Events_Opportunities.pdf into data/solicitations.json
 * Run: npm run parse-pdf
 */
const { readFileSync, writeFileSync, mkdirSync } = require("fs");
const { join, dirname } = require("path");
const { PDFParse } = require("pdf-parse");

const ROOT = join(__dirname, "..");
const PDF_PATH = join(ROOT, "data/Gov_Events_Opportunities.pdf");
const OUTPUT_PATH = join(ROOT, "data/solicitations.json");

const COMPANIES = [
  "Optical Gate",
  "OTEC",
  "Ingenium",
  "Swift Solar",
  "OMC Thermochemistry",
  "MXene Inc",
];

const DEPARTMENTS = [
  "OUSD(A&S)",
  "Space Force",
  "Air Force",
  "Army",
  "Navy",
  "OSD",
  "SOCOM",
  "NASA",
  "DoD",
  "DOE",
  "DHA",
];

const SKIP_PREFIXES = [
  "Solicitations",
  "Red Dates",
  "Department",
  "Solicitation",
  "Organizatio",
  "Optical Gate",
  "OMC",
  "istry",
  "https://",
  "http://",
  "-- ",
  "N/A (",
  "The U.S. Army ERDC",
  "BAA 000",
  "This Commerc",
  "ERDC (US",
  "W912HZ26S",
  "Geotechnical",
  "Information Technology",
  "Construction Engineering",
  "Cold Regions",
  "N/A (Recurrin",
  "HT9425",
  "SP4701",
  "W911QY25R",
  "SPECIAL OPERATIONS",
  "AFWERX Cha",
  "Marketplace fo",
  "(late accepted)",
  "ERDC BOTT",
  "ent Solicitations",
  "Open for 5",
  "Open in perpet",
  "rly Submission",
  "Innovation acc",
  "TDY innovation",
  "Unsolicited Ide",
  "DOE program",
  "Portal for comm",
  "The STRATFI",
  "Geospatial Research",
  "Construction Engineering",
  "Civil Works",
  "Cold Regions Research",
  "Link",
  "Mobilizes Depa",
  "supplemental f",
  "FA865226R0",
  "FA8650-19-S",
  "W911NF21S0",
  "RDK-RAD-FO",
  "DIRECTED ENERGY",
  "FA9451-21-S",
  "W911NF-22-S",
  "W519TC-25-S",
  "N0001426SBC",
  "DON26BZ03-N",
  "DAF26BZ03-N",
  "DLA26BZ03-N",
  "DPA26BZ03-D",
  "ARM26BX03-N",
  "DHA26BZ01-",
  "DPA26BZ01-",
  "OSW26BZ01",
  "SOC26BZ01",
  "DON26BZ01",
  "DON26TZ01",
  "DAF26BZ01-",
  "DAF26TZ01-",
  "ARM26BX01",
  "CBD254-",
  "DMEA254-",
  "DTRA254-",
  "HR0011SB20",
  "SF254-",
  "SF25D-",
  "80NSSC26R",
  "AERO.",
  "GO.",
  "LIVEP.",
  "INSTALG.",
  "COSMO.",
  "EVA.",
  "LAND.",
  "LWS.",
  "ENABLE.",
  "EXPAND.",
  "SURFMOB.",
  "COMNAV.",
  "INSITU.",
  "LIVEI.",
  "SPWX.",
  "ORBECON.",
  "CARITL.",
  "Autonomous Leader",
  "Autonomous Space",
  "Commercial-Derived",
  "Compact Battery",
  "Risk-Aware",
  "Integrated Multidisciplinary",
  "Field Deployable",
  "High Voltage",
  "Development of Small",
  "Environmental Exposure",
  "Extremity Platform",
  "Novel Sampling",
  "Midwest fundin",
  "Future Autonom",
  "NATO (",
  "EMC²-RFI",
  "Demo/validatio",
  "Operational en",
  "Lithium Battery",
];

const DATE_RE = /^(\d{1,2}\/\d{1,2}\/\d{2,4}|TBA|\?|N\/A)$/;

function shouldSkip(line) {
  if (!line.trim()) return true;
  if (line === "x" || line === "Industry") return true;
  if (/^SBIR$|^STTR$/.test(line)) return true;
  return SKIP_PREFIXES.some((prefix) => line.startsWith(prefix));
}

function parseDepartment(line) {
  for (const dept of [...DEPARTMENTS].sort((a, b) => b.length - a.length)) {
    if (line.startsWith(`${dept}\t`) || line.startsWith(`${dept} `)) {
      return {
        department: dept,
        rest: line.slice(dept.length).replace(/^\t/, "").trimStart(),
      };
    }
  }
  return null;
}

function parseCompanyFlags(tokens) {
  const flags = Object.fromEntries(COMPANIES.map((c) => [c, false]));
  const remaining = [...tokens];
  let flagIndex = 0;

  while (remaining.length > 0 && remaining[remaining.length - 1] === "x" && flagIndex < COMPANIES.length) {
    flags[COMPANIES[COMPANIES.length - 1 - flagIndex]] = true;
    remaining.pop();
    flagIndex++;
  }

  return { flags, remaining };
}

const APPLICANT_VALUES = new Set([
  "Industry",
  "Small Business",
  "Small businesses",
  "Govt Only",
  "Academia",
  "Competition winners",
  "Unrestricted",
  "Other",
  "TBD",
  "Not Found",
]);

const TYPE_HINTS = ["SBIR", "STTR", "BAA", "CSO", "CRADA", "BOTTA", "Challenge", "Prize", "Special"];

function splitDateAndTitle(value) {
  const match = value.match(/^(\d{1,2}\/\d{1,2}\/\d{2,4}|TBA|\?|N\/A)\s+(.+)$/i);
  if (match) {
    return { dueDate: match[1], title: match[2] };
  }
  if (DATE_RE.test(value) || /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(value)) {
    return { dueDate: value, title: "" };
  }
  return { dueDate: "", title: value };
}

function inferFields(tokens) {
  const fields = {
    dueDate: "",
    title: "",
    solicitationNumber: "",
    description: "",
    organization: "",
    solicitationType: "",
    keyWords: "",
    applicants: "",
    link: "",
  };

  if (tokens.length === 0) return fields;

  let idx = 0;
  if (tokens[0]) {
    const split = splitDateAndTitle(tokens[0]);
    fields.dueDate = split.dueDate;
    if (split.title) {
      fields.title = split.title;
      idx = 1;
    } else {
      idx = DATE_RE.test(tokens[0]) || /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(tokens[0]) ? 1 : 0;
    }
  }

  const tail = [];
  for (let i = tokens.length - 1; i >= idx; i--) {
    const t = tokens[i];
    const isApplicant = APPLICANT_VALUES.has(t);
    const isType = TYPE_HINTS.some((h) => t.includes(h)) || t.startsWith("SBIR") || t.startsWith("STTR") || t.startsWith("BAA");
    if (isApplicant || isType || (tail.length > 0 && tail.length < 4)) {
      tail.unshift(t);
    } else if (tail.length === 0 && /^[A-Z0-9][A-Z0-9._/-]{2,}$/.test(t) && !t.includes(" ")) {
      fields.solicitationNumber = t;
    } else {
      break;
    }
  }

  const middleEnd = Math.max(idx, tokens.length - tail.length);
  const middle = tokens.slice(idx, middleEnd);

  if (middle.length > 0) {
    fields.title = middle[0];
    if (!fields.solicitationNumber && middle.length > 1 && /^[A-Z0-9]/.test(middle[1])) {
      fields.solicitationNumber = middle[1];
    }
  }

  if (tail.length >= 1) fields.applicants = tail[tail.length - 1];
  if (tail.length >= 2) fields.solicitationType = tail[tail.length - 2];
  if (tail.length >= 3) fields.organization = tail[tail.length - 3];
  if (tail.length > 3) fields.keyWords = tail.slice(0, tail.length - 3).join(" ");

  return fields;
}

function parseLine(line, rowIndex) {
  const parsed = parseDepartment(line);
  if (!parsed) return null;

  const tokens = parsed.rest.split("\t").map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;

  const { flags, remaining } = parseCompanyFlags(tokens);
  const fields = inferFields(remaining);

  if (!fields.title && !fields.dueDate) return null;

  return {
    rowIndex,
    department: parsed.department,
    companyFlags: flags,
    ...fields,
  };
}

function extractUrls(text) {
  return [...text.matchAll(/https:\/\/[^\s]+/g)]
    .map((m) => m[0])
    .filter((url) => url.length > 20);
}

function attachLinks(rows, urls) {
  const sbirUrls = urls.filter((u) => u.includes("sbir.gov/topics/"));
  let sbirIndex = 0;

  return rows.map((row) => {
    if (row.link) return row;
    if (row.solicitationType.toLowerCase().includes("sbir") && sbirIndex < sbirUrls.length) {
      return { ...row, link: sbirUrls[sbirIndex++] };
    }
    return row;
  });
}

async function main() {
  const buffer = readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const lines = result.text.split("\n").map((l) => l.trim()).filter(Boolean);

  const rows = [];
  let rowIndex = 2;

  for (const line of lines) {
    if (shouldSkip(line)) continue;
    const row = parseLine(line, rowIndex);
    if (row) {
      rows.push(row);
      rowIndex++;
    }
  }

  const urls = extractUrls(result.text);
  const withLinks = attachLinks(rows, urls);

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      {
        source: "data/Gov_Events_Opportunities.pdf",
        parsedAt: new Date().toISOString(),
        count: withLinks.length,
        solicitations: withLinks,
      },
      null,
      2,
    ),
  );

  console.log(`Parsed ${withLinks.length} solicitations → ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
