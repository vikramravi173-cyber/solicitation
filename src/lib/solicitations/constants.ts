export const SHEET_ID = "1JOqnwfQAYf33qiXPfMA-DrfBO-n3TRoRUt3Gtqn5j5Q";
export const SHEET_TAB = "Solicitations";

export const COLUMNS = [
  "Department",
  "Due Date",
  "Solicitation Title",
  "Solicitation #",
  "Description",
  "Organization",
  "Solicitation Type",
  "Key Words",
  "Applicants",
  "Link",
  "Optical Gate",
  "OTEC",
  "Ingenium",
  "Swift Solar",
  "OMC Thermochemistry",
  "MXene Inc",
] as const;

export const DEPARTMENTS = [
  "Army",
  "Navy",
  "Air Force",
  "OSD",
  "NASA",
  "SOCOM",
] as const;

export const SOLICITATION_TYPES = [
  "SBIR",
  "STTR",
  "BAA",
  "Prize Competition",
] as const;

export const COMPANIES = [
  "Optical Gate",
  "OTEC",
  "Ingenium",
  "Swift Solar",
  "OMC Thermochemistry",
  "MXene Inc",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type SolicitationType = (typeof SOLICITATION_TYPES)[number];
export type Company = (typeof COMPANIES)[number];
