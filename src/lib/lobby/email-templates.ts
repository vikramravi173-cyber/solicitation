export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: { key: string; label: string; placeholder: string }[];
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "initial-outreach",
    name: "Initial staff outreach",
    subject: "FY{{fiscalYear}} NDAA authorization request — {{projectTitle}}",
    body: `Dear {{stafferName}},

I am writing on behalf of {{legalEntityName}} regarding a FY{{fiscalYear}} Congressional Authorization (NDAA) request for {{projectTitle}}.

Our program supports {{agencyComponent}} and addresses a critical capability gap in {{technicalFocus}}. We respectfully request your office's consideration for inclusion in the NDAA authorization process.

Key details:
• FY{{fiscalYear}} request amount: {{fy27RequestAmt}}
• Budget line / PE: {{budgetLineFy27}} / {{programElement}}
• Primary POC: {{primaryPoc}}

We would welcome the opportunity to brief your defense or appropriations staff at your convenience. I have attached a one-page summary and am happy to provide additional technical detail.

Thank you for your consideration.

Respectfully,
{{senderName}}
{{senderTitle}}
{{legalEntityName}}
{{senderEmail}} | {{senderPhone}}`,
    variables: [
      { key: "fiscalYear", label: "Fiscal year", placeholder: "27" },
      { key: "projectTitle", label: "Project title", placeholder: "Advanced sensor payload" },
      { key: "legalEntityName", label: "Legal entity", placeholder: "Acme Defense Systems, Inc." },
      { key: "agencyComponent", label: "Agency / component", placeholder: "USAF / AFLCMC" },
      { key: "technicalFocus", label: "Technical focus", placeholder: "hypersonic sensing" },
      { key: "fy27RequestAmt", label: "FY request amount", placeholder: "$12M" },
      { key: "budgetLineFy27", label: "Budget line", placeholder: "Research, Development, Test & Evaluation" },
      { key: "programElement", label: "Program element (PE)", placeholder: "060XXXX" },
      { key: "primaryPoc", label: "Primary POC", placeholder: "Jane Smith, Program Director" },
      { key: "stafferName", label: "Staffer name", placeholder: "Defense Legislative Assistant" },
      { key: "senderName", label: "Your name", placeholder: "John Doe" },
      { key: "senderTitle", label: "Your title", placeholder: "CEO" },
      { key: "senderEmail", label: "Your email", placeholder: "john@acme.com" },
      { key: "senderPhone", label: "Your phone", placeholder: "(555) 123-4567" },
    ],
  },
  {
    id: "follow-up",
    name: "Follow-up after no response",
    subject: "Follow-up: {{projectTitle}} — FY{{fiscalYear}} authorization request",
    body: `Dear {{stafferName}},

I wanted to follow up on my {{initialContactDate}} email regarding {{legalEntityName}}'s FY{{fiscalYear}} NDAA authorization request for {{projectTitle}}.

The submission deadline for your office is {{deadline}}. We remain available to provide a 15-minute briefing or written responses to any questions your team may have.

Brief recap:
• Request: {{fy27RequestAmt}} for {{agencyComponent}}
• Regional impact: {{regionalImpact}}

Please let me know if there is additional information we can provide before the deadline.

Best regards,
{{senderName}}
{{legalEntityName}}
{{senderEmail}}`,
    variables: [
      { key: "stafferName", label: "Staffer name", placeholder: "Defense LA" },
      { key: "initialContactDate", label: "Initial contact date", placeholder: "March 1, 2026" },
      { key: "legalEntityName", label: "Legal entity", placeholder: "Acme Defense Systems, Inc." },
      { key: "fiscalYear", label: "Fiscal year", placeholder: "27" },
      { key: "projectTitle", label: "Project title", placeholder: "Advanced sensor payload" },
      { key: "deadline", label: "Office deadline", placeholder: "April 15, 2026" },
      { key: "fy27RequestAmt", label: "Request amount", placeholder: "$12M" },
      { key: "agencyComponent", label: "Agency / component", placeholder: "USAF" },
      { key: "regionalImpact", label: "Regional impact", placeholder: "120 jobs in CO-02" },
      { key: "senderName", label: "Your name", placeholder: "John Doe" },
      { key: "senderEmail", label: "Your email", placeholder: "john@acme.com" },
    ],
  },
  {
    id: "meeting-request",
    name: "Briefing / meeting request",
    subject: "Briefing request: {{projectTitle}} ({{legalEntityName}})",
    body: `Dear {{stafferName}},

{{legalEntityName}} would like to request a brief meeting with your {{committeeFocus}} staff to discuss our FY{{fiscalYear}} authorization request for {{projectTitle}}.

Proposed agenda (15–20 minutes):
1. Program overview and warfighter need
2. FY{{fiscalYear}} funding request ({{fy27RequestAmt}})
3. Regional / workforce justification
4. Q&A

We are flexible on timing between {{availabilityWindow}}. Virtual or in-person works for our team.

Thank you,
{{senderName}}
{{senderTitle}}, {{legalEntityName}}
{{senderEmail}} | {{senderPhone}}`,
    variables: [
      { key: "stafferName", label: "Staffer name", placeholder: "Legislative Director" },
      { key: "legalEntityName", label: "Legal entity", placeholder: "Acme Defense Systems, Inc." },
      { key: "committeeFocus", label: "Committee focus", placeholder: "HASC / SASC" },
      { key: "fiscalYear", label: "Fiscal year", placeholder: "27" },
      { key: "projectTitle", label: "Project title", placeholder: "Advanced sensor payload" },
      { key: "fy27RequestAmt", label: "Request amount", placeholder: "$12M" },
      { key: "availabilityWindow", label: "Availability", placeholder: "March 10–21" },
      { key: "senderName", label: "Your name", placeholder: "John Doe" },
      { key: "senderTitle", label: "Your title", placeholder: "VP Government Relations" },
      { key: "senderEmail", label: "Your email", placeholder: "john@acme.com" },
      { key: "senderPhone", label: "Your phone", placeholder: "(555) 123-4567" },
    ],
  },
  {
    id: "thank-you",
    name: "Post-meeting thank you",
    subject: "Thank you — {{projectTitle}} briefing",
    body: `Dear {{stafferName}},

Thank you for taking the time to meet with our team on {{meetingDate}} to discuss {{projectTitle}}.

As discussed, I am attaching:
• Updated one-pager with FY{{fiscalYear}} request details
• Responses to open questions from your staff

Please do not hesitate to reach out if we can provide anything further before the {{deadline}} submission deadline.

With appreciation,
{{senderName}}
{{legalEntityName}}
{{senderEmail}}`,
    variables: [
      { key: "stafferName", label: "Staffer name", placeholder: "Defense LA" },
      { key: "meetingDate", label: "Meeting date", placeholder: "March 12, 2026" },
      { key: "projectTitle", label: "Project title", placeholder: "Advanced sensor payload" },
      { key: "fiscalYear", label: "Fiscal year", placeholder: "27" },
      { key: "deadline", label: "Submission deadline", placeholder: "April 15, 2026" },
      { key: "senderName", label: "Your name", placeholder: "John Doe" },
      { key: "legalEntityName", label: "Legal entity", placeholder: "Acme Defense Systems, Inc." },
      { key: "senderEmail", label: "Your email", placeholder: "john@acme.com" },
    ],
  },
];

export function renderTemplate(
  template: EmailTemplate,
  values: Record<string, string>,
): { subject: string; body: string } {
  const replace = (text: string) =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key]?.trim() || `[${key}]`);

  return {
    subject: replace(template.subject),
    body: replace(template.body),
  };
}
