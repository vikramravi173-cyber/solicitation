/** DIY Lobbyist toolkit — data model aligned with the Strogen template. */

export type Chamber = "house" | "senate";

export interface ContactLogEntry {
  id: string;
  date: string;
  note: string;
  stafferName?: string;
}

export interface FormFieldDraft {
  id: string;
  question: string;
  response: string;
}

export interface CongressionalMember {
  id: string;
  chamber: Chamber;
  name: string;
  districtOrState: string;
  deadline: string;
  submitted: boolean;
  committees: string;
  formUrl: string;
  instructions: string;
  formFields: FormFieldDraft[];
  contactLog: ContactLogEntry[];
}

export interface EntityInfo {
  legalEntityName: string;
  primaryPoc: string;
  partnerOrg: string;
}

export interface BudgetDetails {
  projectTitle: string;
  agencyComponent: string;
  budgetLineFy27: string;
  programElement: string;
  pb2026Request: string;
  fy27RequestAmt: string;
  dodProgramMgr: string;
}

export interface RegionalJustification {
  region: string;
  talkingPoints: string;
}

export interface LobbyCampaign {
  id: string;
  name: string;
  fiscalYear: string;
  entity: EntityInfo;
  budget: BudgetDetails;
  regions: RegionalJustification[];
  houseMembers: CongressionalMember[];
  senateMembers: CongressionalMember[];
  updatedAt: string;
}

export type LobbyTab = "tracker" | "outreach" | "templates" | "resources" | "assistant";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
