export interface LobbyResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: "lookup" | "guidance" | "template" | "official";
}

/** Curated DIY lobbying resources — official and practitioner sources. */
export const LOBBY_RESOURCES: LobbyResource[] = [
  {
    id: "house-lookup",
    title: "Find Your Representative",
    description: "Official House lookup by ZIP code — start congressional outreach with the right member.",
    url: "https://www.house.gov/representatives/find-your-representative",
    category: "lookup",
  },
  {
    id: "senate-lookup",
    title: "Find Your Senators",
    description: "Official Senate directory — identify both senators for your state.",
    url: "https://www.senate.gov/senators/senators-contact.htm",
    category: "lookup",
  },
  {
    id: "congress-gov",
    title: "Congress.gov Member Profiles",
    description: "Committee assignments, contact forms, and legislative history for every member.",
    url: "https://www.congress.gov/members",
    category: "lookup",
  },
  {
    id: "ndaa-process",
    title: "NDAA Authorization Process (CRS)",
    description: "Congressional Research Service overview of how defense authorization requests work.",
    url: "https://crsreports.congress.gov/",
    category: "guidance",
  },
  {
    id: "sba-lobbying",
    title: "SBA Office of Advocacy — Small Business Lobbying",
    description: "Federal resources for small businesses engaging with Congress on policy and funding.",
    url: "https://advocacy.sba.gov/",
    category: "guidance",
  },
  {
    id: "house-contact",
    title: "House Member Contact Forms",
    description: "Direct links to member websites where authorization request forms are often hosted.",
    url: "https://www.house.gov/representatives",
    category: "official",
  },
  {
    id: "senate-contact",
    title: "Senate Member Websites",
    description: "Official Senate pages with staff directories and contact portals.",
    url: "https://www.senate.gov/general/contact_information/senators_cfm.cfm",
    category: "official",
  },
  {
    id: "usa-spending",
    title: "USAspending.gov",
    description: "Verify agency budget lines and historical awards when drafting authorization requests.",
    url: "https://www.usaspending.gov/",
    category: "guidance",
  },
  {
    id: "congressional-budget",
    title: "Congressional Budget Justification Materials",
    description: "DOD and agency budget books — reference for PE numbers and program elements.",
    url: "https://comptroller.defense.gov/Budget-Materials/",
    category: "guidance",
  },
  {
    id: "lobbying-disclosure",
    title: "Lobbying Disclosure Act Guidance",
    description: "Know when professional lobbying registration applies vs. direct constituent outreach.",
    url: "https://lobbyingdisclosure.house.gov/",
    category: "official",
  },
];

export const RESOURCE_CATEGORY_LABELS: Record<LobbyResource["category"], string> = {
  lookup: "Member lookup",
  guidance: "Guidance",
  template: "Templates",
  official: "Official",
};
