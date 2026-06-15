import type { Company } from "./constants";

export interface SolicitationRow {
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

export interface SearchFilters {
  department?: string;
  solicitationType?: string;
  company?: Company;
}

export interface SearchResult {
  title: string;
  department: string;
  dueDate: string;
  org: string;
  type: string;
  descriptionSnippet: string;
  link: string;
  companyFlags: Partial<Record<Company, boolean>>;
}

export interface SearchRequestBody {
  query?: string;
  filters?: SearchFilters;
}
