import type { LobbyCampaign } from "./types";

export interface AssistantSuggestion {
  label: string;
  prompt: string;
}

export const ASSISTANT_SUGGESTIONS: AssistantSuggestion[] = [
  { label: "Outreach checklist", prompt: "What should I do before contacting a congressional office?" },
  { label: "NDAA timeline", prompt: "Walk me through the NDAA authorization request timeline." },
  { label: "Draft talking points", prompt: "Help me draft regional talking points for my authorization request." },
  { label: "Track my progress", prompt: "How do I track submissions across House and Senate offices?" },
  { label: "Email best practices", prompt: "What makes an effective first email to congressional staff?" },
];

/**
 * Rule-based lobby assistant — runs entirely client-side.
 * Designed as a pluggable framework: swap `getAssistantReply` for an LLM API later.
 */
export function getAssistantReply(
  campaign: LobbyCampaign,
  userMessage: string,
): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("checklist") || msg.includes("before contact")) {
    return `Before reaching out to a congressional office:

1. **Finalize common data** — legal entity, POC, project title, agency/component, budget line, PE number, and FY request amount in the tracker.
2. **Identify the right members** — House member for your district (or relevant authorization committee) and both senators for your state.
3. **Research committees** — note HASC/SASC, appropriations, or relevant authorizing subcommittees on each member profile.
4. **Draft portal responses here first** — use the Form Fields table under each member; do not copy into the portal until finalized.
5. **Prepare a one-pager** — problem, solution, funding ask, regional impact, and POC.
6. **Log every touch** — date, staffer name, and outcome in the contact log.

Your campaign "${campaign.name}" currently has ${campaign.houseMembers.length} House and ${campaign.senateMembers.length} Senate targets tracked.`;
  }

  if (msg.includes("timeline") || msg.includes("ndaa")) {
    return `**Typical FY NDAA authorization request timeline**:

• **Winter–early spring** — Member offices open authorization request portals; deadlines vary by office (often March–April).
• **Spring** — Staff review submissions; follow-up briefings common.
• **Summer** — HASC/SASC mark up authorization bills.
• **Fall** — Conference and final NDAA passage.

**Action:** Enter each office's deadline in your tracker and mark [X] once submission is confirmed. Use the email templates for initial outreach 2–3 weeks before the deadline.`;
  }

  if (msg.includes("talking point") || msg.includes("regional")) {
    const regions = campaign.regions.filter((r) => r.region || r.talkingPoints);
    if (regions.length === 0) {
      return `To draft regional talking points, fill in the **Regional Justification** section of your tracker:

• **Jobs & workforce** — direct/indirect employment in the district or state
• **Supply chain** — small-business subcontractors and geographic spread
• **Facility investment** — capital expenditure or expansion tied to the program
• **Warfighter connection** — how local industry supports the member's constituents who serve

Example: "Our CO-02 facility employs 85 engineers and supports 40 small-business suppliers across Colorado, delivering [capability] to [service branch]."

Add your regions in the Tracker tab and ask me again — I'll help refine them.`;
    }
    return `Based on your saved regional data:\n\n${regions
      .map(
        (r) =>
          `**${r.region || "Region"}**\n${r.talkingPoints || "_(add talking points in the tracker)_"}`,
      )
      .join("\n\n")}\n\nTip: Tie each point to a specific member's district or state when customizing outreach emails.`;
  }

  if (msg.includes("track") || msg.includes("progress") || msg.includes("submission")) {
    const houseDone = campaign.houseMembers.filter((m) => m.submitted).length;
    const senateDone = campaign.senateMembers.filter((m) => m.submitted).length;
    const houseTotal = campaign.houseMembers.length;
    const senateTotal = campaign.senateMembers.length;

    return `**Submission status for ${campaign.name}**

House: ${houseDone}/${houseTotal} confirmed submitted
Senate: ${senateDone}/${senateTotal} confirmed submitted

**How to track:**
• Toggle the checkbox next to each member when the portal submission is confirmed.
• Log every email, call, and meeting with date and staffer name.
• Use **Follow-up** email template if no response within 5–7 business days.

${houseTotal + senateTotal === 0 ? "Add your first House or Senate target in the Congressional Tracker tab to begin." : ""}`;
  }

  if (msg.includes("email") || msg.includes("staff")) {
    return `**Effective first emails to congressional staff:**

• **Subject line** — include "FY${campaign.fiscalYear.replace("FY", "")} NDAA" and your project title.
• **Length** — under 200 words; staff read hundreds of these.
• **Ask** — one clear ask (briefing, form guidance, or deadline confirmation).
• **Proof points** — agency alignment, dollar amount, and regional impact in bullet form.
• **Attachment** — offer a one-pager; don't attach unless requested.
• **POC** — name, title, email, phone at the bottom.

Use the **Email Templates** tab to generate a draft pre-filled from your campaign data.`;
  }

  if (msg.includes("help") || msg.includes("what can you")) {
    return `I'm your **DIY Lobby Assistant** — I help with congressional authorization outreach, NDAA requests, and staff communication.

Try asking about:
• Outreach checklists before contacting offices
• NDAA authorization timelines
• Regional talking points
• Tracking House/Senate submissions
• Email best practices for staff outreach

Or use the suggested prompts below. All guidance runs locally in your browser — your campaign data stays on your device.

_Future: this assistant can connect to an LLM API for personalized drafting._`;
  }

  // Context-aware default using campaign data
  const entity = campaign.entity.legalEntityName || "your organization";
  const project = campaign.budget.projectTitle || "your program";

  return `I can help ${entity} with DIY lobbying for ${project}.

Based on your question, I'd suggest:
1. Check the **Resources** tab for official member lookup tools.
2. Add or update targets in the **Congressional Tracker**.
3. Generate a tailored email in **Email Templates**.

Ask me about checklists, timelines, talking points, tracking, or email tips — or click a suggested prompt below.`;
}
