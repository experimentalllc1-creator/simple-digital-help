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
    headline: "Five new prospects. Every working day.",
    description: "Milo searches for roofing contractors in Florida and adds their business information to your Google spreadsheet, automatically, Monday through Friday.",
    reassurance: "No manual searching. No duplicate entries. No CRM required.",
    demo: {
      src: "/milo-spreadsheet-loop.mp4",
      poster: "/milo-spreadsheet-poster.jpg",
      caption: "Example of Milo populating a Google spreadsheet.",
    },
    deliverablesHeading: "Your prospect list, automatically updated.",
    deliverablesCopy: "Milo creates and maintains a Google spreadsheet containing the businesses he discovers.",
    fields: [
      "Business name", "City", "Website", "Public business email",
      "Phone number", "Date added", "Contacted? (Yes/No)",
    ],
    qualificationCopy: "Milo checks existing records before adding new businesses. His daily target is five qualifying prospects with publicly available business email addresses.",
    installationSteps: [
      "Receive Milo and his installation instructions.",
      "Install Milo and connect your Google account.",
      "Complete the first run and activate recurring prospect discovery.",
    ],
  },
};
