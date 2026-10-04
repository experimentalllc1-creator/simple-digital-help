export type MiloPresentation = {
  headline: string;
  description: string;
  reassurance: string;
  demo: { src: string; poster: string; caption: string };
  deliverablesHeading: string;
  deliverablesCopy: string;
  fields: string[];
  qualificationCopy: string;
  installationSteps: string[];
};

// Presentation only. Pricing and checkout configuration belong to the next phase.
export const miloPresentations: Record<string, MiloPresentation> = {
  "milo-florida-roofing-contractors": {
    headline: "Up to 5 new qualified prospects per scheduled workday when available.",
    description: "Milo searches for roofing contractors in Florida and adds their business information to your Google spreadsheet, automatically, Monday through Friday.",
    reassurance: "No manual searching. No duplicate entries. No CRM required.",
    demo: {
      src: "/milo-spreadsheet-loop.mp4",
      poster: "/milo-spreadsheet-poster.jpg",
      caption: "Illustrative spreadsheet demonstration. Follow the v2.2 guide for the current workspace structure.",
    },
    deliverablesHeading: "Your prospect list, automatically updated.",
    deliverablesCopy: "Milo creates and maintains a Google spreadsheet containing the businesses he discovers.",
    fields: [
      "Date added", "Business name", "City", "Region", "Customer type",
      "Verified business website", "Contacted? (Yes/No)",
    ],
    qualificationCopy: "Milo verifies business websites and checks existing records before adding new businesses. Milo does not research email addresses or phone numbers. Contact research is handled by the separate First Contact Agent.",
    installationSteps: [
      "Receive Milo and his installation instructions.",
      "Install Milo and connect your Google account.",
      "Complete the first run and activate recurring prospect discovery.",
    ],
  },
};
