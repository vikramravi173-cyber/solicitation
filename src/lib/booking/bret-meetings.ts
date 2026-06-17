export interface BretMeetingOption {
  id: string;
  title: string;
  description: string;
  meta?: string;
  /** Calendly, HubSpot, or other booking URL — replace `#` when ready. */
  href: string;
}

/** Update `href` values when booking links are available. */
export const BRET_MEETING_OPTIONS: BretMeetingOption[] = [
  {
    id: "intro",
    title: "Intro call with Bret",
    description: "Quick overview of your company, goals, and where federal opportunities fit.",
    meta: "30 min",
    href: "#",
  },
  {
    id: "strategy",
    title: "Opportunity strategy session",
    description: "Walk through your top matches, pursuit priorities, and next steps with Bret.",
    meta: "45 min",
    href: "#",
  },
  {
    id: "deep-dive",
    title: "Deep-dive working session",
    description: "Hands-on review of solicitations, teaming, and capture planning.",
    meta: "60 min",
    href: "#",
  },
];
