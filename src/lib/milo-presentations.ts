import { miloAssignments } from "./milo-assignments";
export type MiloPresentation = {
  headline: string;
  description: string;
  reassurance: string;
  demo?: { src: string; poster: string; caption: string };
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
    description: "Milo searches for roofing contractors in Florida and adds their business information to your Google spreadsheet, automatically. Monday-Friday, in the morning, customer local time.",
    reassurance: "No manual searching. No duplicate entries. No CRM required.",
    demo: {
      src: "/milo-spreadsheet-v2-4.mp4",
      poster: "/milo-spreadsheet-v2-4.png",
      caption: "Illustrative spreadsheet demonstration. Follow the v2.4 guide for the current workspace structure.",
    },
    deliverablesHeading: "Your prospect list, automatically updated.",
    deliverablesCopy: "Milo manages the first six columns of your prospect spreadsheet. Contacted? starts as No for new prospects and belongs to you afterward. Email, Phone, and Notes are entirely yours; Milo never changes those cells.",
    fields: [
      "Date added", "Business name", "City", "Region", "Customer type",
      "Verified business website", "Contacted? (customer-owned)", "Email (customer-owned)", "Phone (customer-owned)", "Notes (customer-owned)",
    ],
    qualificationCopy: "Milo verifies business websites and checks existing records before adding new businesses. Milo does not research email addresses or phone numbers.",
    installationSteps: [
      "Receive Milo and his installation instructions.",
      "Install Milo and connect your Google account.",
      "Complete the first run and activate recurring prospect discovery.",
    ],
  },
};

miloPresentations["milo-us-building-materials-manufacturers"] = {
  ...miloPresentations["milo-florida-roofing-contractors"],
  headline: "Up to 2 new qualified manufacturers per weekly run when available.",
  description: "Milo discovers actual manufacturers of building products and construction materials across the entire United States and adds verified businesses to your shared Google spreadsheet. Once per week, Monday at 9:00 AM in your local timezone.",
  reassurance: "One nationwide assignment. No duplicate businesses. No CRM required.",
  demo: undefined,
  qualificationCopy: "An official business website must provide evidence that the company itself manufactures products incorporated into residential, commercial, institutional, industrial, or infrastructure construction. Pure distributors, wholesalers, dealers, retailers, importers, sales agencies, contractors, installers, consultants, and service businesses are excluded unless their own qualifying manufacturing is clearly verified. Milo seeks diversity across product categories and geography without favoring a material or filling an unverifiable quota. Region records the verified U.S. headquarters or principal-location state; Customer Type is Building Materials Manufacturer. Duplicate checks cover every business in the shared Prospects sheet. Milo does not research contact details or send outreach.",
};

// Texas uses Florida's approved copy and structure, with no video.
miloPresentations["milo-texas-roofing-contractors"] = {
  ...miloPresentations["milo-florida-roofing-contractors"],
  description: miloPresentations["milo-florida-roofing-contractors"].description.replace("Florida", "Texas"),
  demo: undefined,
};

// California uses the same approved regional presentation, with no video.
miloPresentations["milo-california-roofing-contractors"] = {
  ...miloPresentations["milo-florida-roofing-contractors"],
  description: miloPresentations["milo-florida-roofing-contractors"].description.replace("Florida", "California"),
  demo: undefined,
};

// Northeast uses California's approved presentation and the existing nine-state boundary.
miloPresentations["milo-northeast-roofing-contractors"] = {
  ...miloPresentations["milo-california-roofing-contractors"],
  description: miloPresentations["milo-california-roofing-contractors"].description.replace("California", "Northeast") + " Territory: ME, NH, VT, MA, RI, CT, NY, NJ, PA.",
  demo: undefined,
};

// Southeast follows Northeast with the existing thirteen-state boundary.
miloPresentations["milo-southeast-roofing-contractors"] = {
  ...miloPresentations["milo-northeast-roofing-contractors"],
  description: miloPresentations["milo-northeast-roofing-contractors"].description.replace("Northeast", "Southeast").replace("ME, NH, VT, MA, RI, CT, NY, NJ, PA", "DE, MD, VA, WV, KY, TN, NC, SC, GA, AL, MS, AR, LA"),
  demo: undefined,
};

// Midwest follows Southeast with the existing twelve-state boundary.
miloPresentations["milo-midwest-roofing-contractors"] = {
  ...miloPresentations["milo-southeast-roofing-contractors"],
  description: miloPresentations["milo-southeast-roofing-contractors"].description.replace("Southeast", "Midwest").replace("DE, MD, VA, WV, KY, TN, NC, SC, GA, AL, MS, AR, LA", "OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS"),
  demo: undefined,
};

// Southwest follows Midwest with the existing four-state boundary.
miloPresentations["milo-southwest-roofing-contractors"] = {
  ...miloPresentations["milo-midwest-roofing-contractors"],
  description: miloPresentations["milo-midwest-roofing-contractors"].description.replace("Midwest", "Southwest").replace("OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS", "AZ, NM, NV, OK"),
  demo: undefined,
};

// Mountain West follows Southwest with the existing four-state boundary.
miloPresentations["milo-mountain-west-roofing-contractors"] = {
  ...miloPresentations["milo-southwest-roofing-contractors"],
  description: miloPresentations["milo-southwest-roofing-contractors"].description.replace("Southwest", "Mountain West").replace("AZ, NM, NV, OK", "CO, UT, WY, MT"),
  demo: undefined,
};

// Pacific Northwest follows Mountain West with the existing three-state boundary.
miloPresentations["milo-pacific-northwest-roofing-contractors"] = {
  ...miloPresentations["milo-mountain-west-roofing-contractors"],
  description: miloPresentations["milo-mountain-west-roofing-contractors"].description.replace("Mountain West", "Pacific Northwest").replace("CO, UT, WY, MT", "WA, OR, ID"),
  demo: undefined,
};

// HVAC shares the approved structure with qualification and family-specific copy.
for (const assignment of miloAssignments.filter(item => item.agentId === "hvac")) {
  const source = miloPresentations[`milo-${assignment.regionId}-roofing-contractors`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    description: source.description.replaceAll("roofing", "HVAC"),
    reassurance: "No manual searching. No duplicate HVAC entries. No CRM required.",
    qualificationCopy: "Milo verifies active HVAC contractors, their location or service area, and attributable business websites. Residential, commercial, and mixed-trade businesses qualify when HVAC service or installation is meaningful. It checks HVAC records across all regions; other customer types do not block an HVAC entry. Milo does not research email addresses or phone numbers or send outreach.",
  };
}

// Plumbing uses the existing regional presentation with its own qualification rules.
for (const assignment of miloAssignments.filter(item => item.agentId === "plumbing")) {
  const source = miloPresentations[`milo-${assignment.regionId}-hvac-contractors`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    description: source.description.replaceAll("HVAC", "plumbing"),
    reassurance: "No manual searching. No duplicate Plumbing entries. No CRM required.",
    qualificationCopy: "Milo verifies active plumbing contractors, their location or service area, and attributable business websites. Residential and commercial contractors qualify when plumbing service, installation, repair, piping, drain/sewer, water-heater, or closely related plumbing work is meaningful. Companies may also offer HVAC, electrical, mechanical, or other trades. Milo checks Plumbing Contractors records across all regions; other customer types do not block a Plumbing entry. Milo does not research email addresses or phone numbers or send outreach.",
  };
}

// Electrical shares the existing regional structure with its own qualification rules.
for (const assignment of miloAssignments.filter(item => item.agentId === "electrical")) {
  const source = miloPresentations[`milo-${assignment.regionId}-plumbing-contractors`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    description: source.description.replaceAll("plumbing", "electrical"),
    reassurance: "No manual searching. No duplicate Electrical entries. No CRM required.",
    qualificationCopy: "Milo verifies real, active electrical contractors, their location or service area, and attributable business websites. Residential, commercial, and industrial contractors qualify when electrical installation, repair, service, wiring, panel/service upgrades, lighting, generators, controls, low-voltage, or closely related electrical contracting work is meaningful. Companies may also offer HVAC, plumbing, mechanical, solar, or other trades. Milo checks Electrical Contractors records across all regions; other customer types do not block an Electrical entry. Milo does not research email addresses or phone numbers or send outreach.",
  };
}

// General Contractors uses the existing regional presentation and its own qualification.
for (const assignment of miloAssignments.filter(item => item.agentId === "general-contractors")) {
  const source = miloPresentations[`milo-${assignment.regionId}-electrical-contractors`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    description: source.description.replaceAll("electrical", "general"),
    reassurance: "No manual searching. No duplicate General Contractors entries. No CRM required.",
    qualificationCopy: 'Milo verifies real, active general contractors, their location or service area, and attributable business websites. Residential, commercial, industrial, institutional, and mixed-market contractors qualify when general contracting, construction management, design-build, new construction, renovation/remodeling, tenant improvement, or comparable whole-project construction responsibility is meaningful. Companies may self-perform specialty trades or offer roofing, HVAC, plumbing, electrical, concrete, carpentry, restoration, development, or other construction services. Specialty-only subcontractors and a business merely using the word "contractor" do not qualify without public evidence of genuine general contracting / prime-contractor work. Builders or homebuilders qualify only with current public evidence of meaningful general contracting or comparable whole-project contracting; Builders / Homebuilders remains a separate customer type. Milo checks General Contractors records across all regions; other customer types do not block a General Contractors entry. Milo does not research email addresses or phone numbers or send outreach.',
  };
}
