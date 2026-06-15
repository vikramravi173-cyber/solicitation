import { google } from "googleapis";
import {
  COMPANIES,
  COLUMNS,
  SHEET_ID,
  SHEET_TAB,
} from "@/lib/solicitations/constants";
import type { Company } from "@/lib/solicitations/constants";
import type { SolicitationRow } from "@/lib/solicitations/types";

function getServiceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  }

  return JSON.parse(raw) as Record<string, string>;
}

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getServiceAccountCredentials(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

function isFlagged(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "x" || normalized === "true" || normalized === "yes" || normalized === "1";
}

function rowToSolicitation(values: string[]): SolicitationRow {
  const get = (index: number) => values[index]?.trim() ?? "";

  const companyFlags = COMPANIES.reduce(
    (flags, company, index) => {
      const columnIndex = 10 + index;
      flags[company] = isFlagged(values[columnIndex]);
      return flags;
    },
    {} as Record<Company, boolean>,
  );

  return {
    department: get(0),
    dueDate: get(1),
    title: get(2),
    solicitationNumber: get(3),
    description: get(4),
    organization: get(5),
    solicitationType: get(6),
    keyWords: get(7),
    applicants: get(8),
    link: get(9),
    companyFlags,
  };
}

export async function fetchSolicitations(): Promise<SolicitationRow[]> {
  const sheets = getSheetsClient();
  const range = `${SHEET_TAB}!A2:${String.fromCharCode(64 + COLUMNS.length)}`;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const rows = response.data.values ?? [];
  return rows
    .filter((row) => row.some((cell) => cell?.trim()))
    .map((row) => rowToSolicitation(row as string[]));
}
