import type { LobbyCampaign } from "./types";

const STORAGE_KEY = "capture-deck-lobby-campaign";

export function emptyCampaign(): LobbyCampaign {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "FY27 Congressional Authorization (NDAA)",
    fiscalYear: "FY27",
    entity: { legalEntityName: "", primaryPoc: "", partnerOrg: "" },
    budget: {
      projectTitle: "",
      agencyComponent: "",
      budgetLineFy27: "",
      programElement: "",
      pb2026Request: "",
      fy27RequestAmt: "",
      dodProgramMgr: "",
    },
    regions: [
      { region: "", talkingPoints: "" },
      { region: "", talkingPoints: "" },
    ],
    houseMembers: [],
    senateMembers: [],
    updatedAt: now,
  };
}

export function clearLobbyStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadCampaign(): LobbyCampaign {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCampaign();
    const parsed = JSON.parse(raw) as LobbyCampaign;
    return { ...emptyCampaign(), ...parsed, updatedAt: parsed.updatedAt ?? new Date().toISOString() };
  } catch {
    return emptyCampaign();
  }
}

export function saveCampaign(campaign: LobbyCampaign): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...campaign, updatedAt: new Date().toISOString() }),
  );
}

export function exportCampaignJson(campaign: LobbyCampaign): string {
  return JSON.stringify(campaign, null, 2);
}
