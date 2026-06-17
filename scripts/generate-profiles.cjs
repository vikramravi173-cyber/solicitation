/**
 * Pre-generates full solicitation profiles for every catalog entry.
 * Run: npm run generate-profiles
 */
const { readFileSync, writeFileSync, mkdirSync } = require("fs");
const { join, dirname } = require("path");

const ROOT = join(__dirname, "..");
const INPUT = join(ROOT, "data/solicitations.json");
const OUTPUT = join(ROOT, "data/solicitation-profiles.json");

const PLACEHOLDER = new Set(["tbd", "tba", "n/a", "?", "not found", ""]);

function isMeaningful(value) {
  return !PLACEHOLDER.has(String(value || "").trim().toLowerCase());
}

function resolveDisplayTitle(s) {
  if (isMeaningful(s.title)) return s.title.trim();
  if (isMeaningful(s.solicitationNumber)) return s.solicitationNumber.trim();
  const sbir = s.link?.match(/sbir\.gov\/topics\/(\d+)/i);
  if (sbir) {
    const org = isMeaningful(s.organization) ? ` (${s.organization})` : "";
    return `SBIR Topic ${sbir[1]}${org}`;
  }
  const parts = [];
  if (isMeaningful(s.solicitationType)) parts.push(s.solicitationType.trim());
  if (isMeaningful(s.organization)) parts.push(s.organization.trim());
  if (parts.length > 0) {
    const due = isMeaningful(s.dueDate) ? ` — Due ${s.dueDate}` : "";
    return `${s.department} ${parts.join(" / ")}${due}`;
  }
  if (isMeaningful(s.keyWords)) return `${s.department}: ${s.keyWords.trim()}`;
  if (isMeaningful(s.applicants)) return `${s.department} Opportunity for ${s.applicants}`;
  const due = isMeaningful(s.dueDate) ? ` (Due ${s.dueDate})` : "";
  return `${s.department} Solicitation #${s.rowIndex}${due}`;
}

function buildProfile(s) {
  const displayTitle = resolveDisplayTitle(s);
  const gaps = [];
  if (!isMeaningful(s.title)) gaps.push("Missing solicitation title in catalog");
  if (!s.link) gaps.push("No official link in catalog");
  if (!isMeaningful(s.description)) gaps.push("No description in catalog");
  if (!isMeaningful(s.dueDate)) gaps.push("Due date not listed");
  if (!isMeaningful(s.solicitationType)) gaps.push("Solicitation type not specified");

  const summaryParts = [
    `${displayTitle} is listed under ${s.department} in the Gov Events & Opportunities catalog.`,
  ];
  if (isMeaningful(s.organization)) summaryParts.push(`Issuing or sponsoring organization: ${s.organization}.`);
  if (isMeaningful(s.solicitationType)) {
    summaryParts.push(`Solicitation type: ${s.solicitationType}. This shapes the contracting instrument, evaluation path, and typical proposal structure.`);
  }
  if (isMeaningful(s.keyWords)) summaryParts.push(`Catalog keywords / focus areas: ${s.keyWords}.`);
  if (isMeaningful(s.description)) summaryParts.push(`Catalog description: ${s.description}`);
  else if (!isMeaningful(s.keyWords)) {
    summaryParts.push("The catalog does not include a free-text description for this entry. Use the official link or agency release to obtain the full scope and technical objectives.");
  }
  if (isMeaningful(s.dueDate)) summaryParts.push(`Listed due date: ${s.dueDate}. Confirm whether this is a hard deadline or a rolling/open submission window.`);

  let whoCanSubmit = "";
  if (isMeaningful(s.applicants)) whoCanSubmit += `Catalog lists eligible applicants as: ${s.applicants}. `;
  const type = (s.solicitationType || "").toLowerCase();
  if (type.includes("sbir") || type.includes("sttr")) {
    whoCanSubmit += "U.S. small businesses meeting SBA size standards are the primary eligible entity.";
  } else if (!whoCanSubmit) {
    whoCanSubmit = "Applicant eligibility is not fully specified in the catalog. Download the official solicitation to confirm whether your organization can submit as prime or must team.";
  }

  let funding = "Funding levels are not specified in the catalog. Review the official solicitation package for award size, period of performance, and any cost-share requirements.";
  if (type.includes("sbir phase i")) funding = "Typical SBIR Phase I awards are up to $150,000–$275,000 for 6–12 months depending on agency — verify the exact amount in the topic solicitation.";
  if (type.includes("sbir phase ii")) funding = "SBIR Phase II awards are typically $1M+ over 24 months — confirm agency-specific caps and Phase I-to-II transition requirements.";

  return {
    rowIndex: s.rowIndex,
    displayTitle,
    catalogTitle: s.title,
    department: s.department,
    solicitationNumber: s.solicitationNumber,
    organization: s.organization,
    solicitationType: s.solicitationType,
    dueDate: s.dueDate,
    link: s.link,
    keyWords: s.keyWords,
    applicants: s.applicants,
    whoCanSubmit,
    summary: summaryParts.join("\n\n"),
    funding,
    requirements: type.includes("sbir")
      ? "SBIR proposals typically require a technical volume, cost proposal, and commercialization plan. Verify page limits and submission portal in the official topic package."
      : "Submission requirements are not available in the catalog. Obtain the full RFP/BAA/topic package for volumes, page limits, and submission instructions.",
    evaluationCriteria: type.includes("sbir")
      ? "SBIR/STTR evaluations typically weight technical merit, team qualifications, and commercialization potential. Agency-specific rubrics are in the solicitation."
      : "Evaluation criteria are not listed in the catalog. Build a compliance matrix from the official solicitation document.",
    catalogGaps: gaps,
    sourcesUsed: ["Gov Events & Opportunities catalog", ...(s.link ? [s.link] : [])],
  };
}

function main() {
  const data = JSON.parse(readFileSync(INPUT, "utf8"));
  const profiles = data.solicitations.map(buildProfile);

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: INPUT,
        count: profiles.length,
        profiles,
      },
      null,
      2,
    ),
  );

  const emptyTitles = profiles.filter((p) => !isMeaningful(p.catalogTitle)).length;
  console.log(`Generated ${profiles.length} solicitation profiles → ${OUTPUT}`);
  console.log(`Resolved display titles for ${emptyTitles} entries missing catalog titles`);
}

main();
