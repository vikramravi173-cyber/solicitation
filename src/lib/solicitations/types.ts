import type { Company } from "./constants";

export interface SolicitationRow {
  rowIndex: number;
  department: string;
  dueDate: string;
  title: string;
  solicitationNumber: string;
  description: string;
  organization: string;
  solicitationType: string;
  keyWords: string;
  applicants: string;
  link: string;
  companyFlags: Record<Company, boolean>;
}
