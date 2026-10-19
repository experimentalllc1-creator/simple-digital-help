import { miloAssignments } from "./milo-assignments";
import { projectHeaders } from "./milo-projects";
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

for (const assignment of miloAssignments.filter(item => item.agentId === "projects-developments")) {
  miloPresentations[assignment.slug] = {
    headline: "Early alerts for projects entering site plan or subdivision review.",
    description: `Milo identifies residential, commercial, industrial, institutional and mixed-use development opportunities in ${assignment.region}. Weekly, flexible mornings in your local time zone, for 52 weeks from successful activation. $99 one-time per state.`,
    reassurance: "Selective coverage. No minimum discoveries or immediate identification promised. Customers handle their own due diligence.",
    deliverablesHeading: "Your project register and source coverage.",
    deliverablesCopy: "All project states share Simple Digital Help - Projects & Developments, separate from Sales Prospects. Projects stores verified new discoveries; Source Coverage records checked sources and access limitations. Existing records are preserved.",
    fields: projectHeaders,
    qualificationCopy: "Each investigation attempts public web discovery, official city/county records and supporting documents. Initial discovery covers projects entering the target stage in the preceding three months; weekly work finds new identities with overlapping publication windows. Zero-project weeks are acceptable. Milo does not monitor existing projects, evaluate feasibility, recommend pursuit, contact project participants or create CRM records.",
    installationSteps: ["Receive your state-specific installation TXT and illustrated PDF by email.", "Upload the TXT in ChatGPT and let Milo verify Google access and your separate shared project spreadsheet.", "Verify the weekly flexible local-morning task and 52-week expiration, then begin initial discovery."],
  };
}

miloPresentations["milo-us-building-materials-manufacturers"] = {
  ...miloPresentations["milo-florida-roofing-contractors"],
  headline: "Up to 2 new qualified manufacturers per weekly run when available.",
  description: "Milo discovers actual manufacturers of building products and construction materials across the entire United States and adds verified businesses to your shared Google spreadsheet. Every week, in the morning, in your local time zone. Weekly recurrence remains Monday.",
  reassurance: "One nationwide assignment. No duplicate businesses. No CRM required.",
  demo: undefined,
  qualificationCopy: "An official business website must provide evidence that the company itself manufactures products incorporated into residential, commercial, institutional, industrial, or infrastructure construction. Pure distributors, wholesalers, dealers, retailers, importers, sales agencies, contractors, installers, consultants, and service businesses are excluded unless their own qualifying manufacturing is clearly verified. Milo seeks diversity across product categories and geography without favoring a material or filling an unverifiable quota. Region records the verified U.S. headquarters or principal-location state; Customer Type is Building Materials Manufacturer. Duplicate checks cover every business in the shared Prospects sheet. Milo does not research contact details or send outreach.",
};

miloPresentations["milo-us-production-homebuilders-developers"] = {
  ...miloPresentations["milo-florida-roofing-contractors"],
  headline: "1 qualified company per weekday, Monday-Friday, when available.",
  description: "Milo discovers national and regional production homebuilders and established residential community developers across the entire United States and adds verified companies to your shared Google spreadsheet. One nationwide assignment, no regional selection. 52 weeks from successful activation, maximum 260 prospects.",
  reassurance: "Nationwide company discovery. No duplicate companies. No CRM required.",
  demo: undefined,
  qualificationCopy: "Require current official website evidence of production homebuilding or established residential community development. Exclude individual custom-home contractors, remodelers, brokers, and subcontractors. Track companies, not individual communities: communities, subdivisions, developments, sales offices, branches, and regional divisions of the same company do not count as separate prospects. Check company identities, aliases, parent relationships, and normalized official website domains across the entire shared Prospects sheet, regardless of state or customer type. Region is the verified headquarters or principal-location state; Customer Type is Builders / Homebuilders. Milo does not research contact details or send outreach.",
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

// Architects follows the existing regional Milo presentation and workspace.
for (const assignment of miloAssignments.filter(item => item.agentId === "architects")) {
  const source = miloPresentations[`milo-${assignment.regionId}-electrical-contractors`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    headline: "5 qualified architectural firms per weekday, Monday-Friday, when available.",
    description: `Milo finds active architectural firms and architecture studios designing residential, commercial, industrial, and institutional buildings in ${assignment.region}, then adds verified firms to your shared Google spreadsheet. Monday-Friday mornings in your local timezone. 52 weeks from successful activation; maximum 1,300 prospects per installation.`,
    reassurance: "No manual searching. No duplicate architecture firms. No CRM required.",
    qualificationCopy: "Independent and established architecture practices of all sizes qualify with current official website evidence of relevant building-design work in the selected region. Exclude interior-design-only, landscape-only, engineering-only, and inactive firms. Count each firm once across all Architects regions in your customer workspace; separate offices, branches, studios of the same firm, and individual projects are not additional prospects. Compare firm identities, aliases, parent relationships, and normalized official website domains. Other customer types remain separate assignments. Milo does not research email addresses or phone numbers or send outreach.",
  };
}

// Landscaping uses the approved regional workspace and installation flow.
for (const assignment of miloAssignments.filter(item => item.agentId === "landscaping")) {
  const source = miloPresentations[`milo-${assignment.regionId}-architects`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    headline: "Up to 5 qualified landscaping companies per weekday, Monday-Friday, when available.",
    description: `Milo finds active landscaping companies offering landscape installation, maintenance, lawn care, design-build, or related landscaping services in ${assignment.region}, then adds verified companies to your shared Google spreadsheet. Monday-Friday mornings in your local timezone. $99 one-time for 52 weeks from successful activation; maximum 1,300 prospects per installation.`,
    reassurance: "No manual searching. No duplicate landscaping companies. No CRM required.",
    qualificationCopy: "Independent and established landscaping companies of all sizes qualify with current official website evidence of meaningful residential, commercial, or institutional landscaping services in the selected region. Landscape installation, maintenance, lawn care, and landscape design-build qualify; irrigation, hardscaping, and tree care qualify when offered as part of meaningful landscaping services. Exclude suppliers or nurseries without landscaping services, design-only architecture practices, specialty-only businesses without landscaping services, and inactive companies. Count each company once across all Landscaping Companies regions in your customer workspace; offices, branches, crews, and individual projects are not additional prospects. Compare company identities, aliases, parent relationships, and normalized official website domains. Other customer types remain separate assignments. Milo does not research email addresses or phone numbers or send outreach.",
  };
}

// Property Management Companies uses the existing regional product and workspace.
for (const assignment of miloAssignments.filter(item => item.agentId === "property-managers")) {
  const source = miloPresentations[`milo-${assignment.regionId}-landscaping-companies`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    headline: "Up to 5 qualified property management companies per scheduled workday, when available.",
    description: `Milo finds active property management companies in ${assignment.region} and adds verified businesses to your shared Google spreadsheet. Every weekday morning, in your local time zone. $99 one-time for 52 weeks from successful activation; maximum 1,300 prospects per installation.`,
    reassurance: "No manual searching. No duplicate property management companies. No CRM required.",
    qualificationCopy: "Include residential, commercial, multifamily and apartment, rental, single-family rental, condominium and HOA, vacation and short-term rental, mixed-use, and institutional or portfolio property management, with no specialization prioritized over another. Require meaningful, verifiable property management services and an attributable business website in the selected region. Exclude sales-or-leasing-only real estate brokerages, individual agents without property management operations, listing websites and directories, software vendors, maintenance-only contractors, and unverified or inactive businesses. Check company identity, aliases, parent relationships and normalized official domains across all Property Management Companies regions. Offices, branches, properties and managed portfolios are not separate prospects. Other customer types remain separate assignments. No email discovery, outbound contact or CRM integration.",
  };
}

// HOA variants retain the latest regional architecture with association-specific policy.
for (const assignment of miloAssignments.filter(item => item.agentId === "hoas")) {
  const source = miloPresentations[`milo-${assignment.regionId}-property-management-companies`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    headline: "Up to 5 qualified community associations per scheduled weekday, when available.",
    description: `Milo finds active community associations in ${assignment.region} and adds verified prospects to your shared Google spreadsheet. Monday-Friday, flexible AM/morning in your local time zone. No fixed hour or exact execution-time promise. $99 one-time for 52 weeks from successful activation; maximum 1,300 prospects per installation.`,
    reassurance: "No manual searching. No duplicate associations. No CRM required.",
    qualificationCopy: "Include homeowners associations, condominium associations, townhome associations, residential master associations, planned community associations, and community associations operating under equivalent names. Do not prioritize luxury communities, large associations or a residential property type. Require verifiable association identity, regional location and an attributable website establishing existence and association role. A management-company or community-portal page may qualify when association-specific and attributable; do not invent standalone websites. Exclude management companies/vendors as prospects, directories/listing platforms, inactive/unverifiable associations and duplicates. Compare association identity, aliases, location/community boundaries and canonical association page paths across this category's regions. A shared host domain alone must not merge distinct associations. No contact-data research, automated outreach or CRM integration.",
  };
}

for (const assignment of miloAssignments.filter(item => item.agentId === "distributors")) {
  const source = miloPresentations[`milo-${assignment.regionId}-hoas`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    headline: "Up to 5 qualified distributors per scheduled weekday, when available.",
    description: `Milo finds active wholesale distributors and B2B product suppliers in ${assignment.region} and adds verified prospects to your shared Google spreadsheet. Monday-Friday, flexible AM/morning in your local time zone. No fixed hour or exact execution-time promise. $99 one-time for 52 weeks from successful activation; maximum 1,300 prospects per installation.`,
    reassurance: "No manual searching. No duplicate distributor businesses. No CRM required.",
    qualificationCopy: "Include building materials and construction supplies; roofing, siding, windows and exterior products; plumbing and HVAC supplies; electrical supplies; industrial equipment and components; machinery, tools and hardware; food and beverage wholesale; hospitality and restaurant supplies; medical and dental supplies; and other legitimate B2B wholesale distribution sectors. Do not favor one distribution specialty over another. Require genuine wholesale distribution or B2B supply operations demonstrated through an attributable, verifiable business website in the assigned region. Exclude consumer-only retail stores, manufacturers without meaningful distribution operations, freight carriers/logistics-only companies, marketplaces/directories and unverified/inactive businesses. Deduplicate normalized business identities, aliases, parent relationships and official website domains across all Distributors regions. Branches, warehouses and product divisions of the same business are not separate prospects. No email discovery, automated outreach or CRM integration.",
  };
}

for (const assignment of miloAssignments.filter(item => item.agentId === "hotels")) {
  const source = miloPresentations[`milo-${assignment.regionId}-distributors`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    headline: "Up to 5 qualified hotels and resorts per scheduled weekday, when available.",
    description: `Milo finds currently operating hotels, resorts and commercial lodging properties in ${assignment.region} and adds verified prospects to your shared Google spreadsheet. Monday-Friday, flexible AM/morning in your local time zone. No fixed hour or exact execution-time promise. $99 one-time for 52 weeks from successful activation; maximum 1,300 prospects per installation.`,
    reassurance: "No manual searching. No duplicate lodging properties. No CRM required.",
    qualificationCopy: "Include independent, boutique, branded and chain, full-service, limited-service, luxury, extended-stay, conference and convention hotels; beach, mountain, golf and destination resorts; lodging groups operating identifiable hotel properties; and other commercial lodging businesses. Do not prioritize class, brand, size or price segment. Require identifiable currently operating lodging properties, verified regional locations and attributable official websites. Distinct branded properties with distinct locations and official property pages may qualify separately; a shared chain/operator/domain alone must not merge them. Deduplicate property identity, address/location, aliases/former names and canonical official property URLs. Do not double-count a property through group and property records or add brand offices as extra prospects. Exclude individual-home/apartment short-term rental listings, vacation rental marketplaces, travel agencies/booking-only platforms, restaurants/event venues without meaningful lodging, proposed properties not yet operating and inactive/unverifiable establishments. No email discovery, outreach or CRM integration.",
  };
}

for (const assignment of miloAssignments.filter(item => item.agentId === "restaurants")) {
  const source = miloPresentations[`milo-${assignment.regionId}-distributors`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    headline: "Up to 5 qualified restaurants per scheduled weekday, when available.",
    description: `Milo finds active restaurant businesses at permanent locations in ${assignment.region} and adds verified prospects to your shared Google spreadsheet. Monday-Friday, flexible AM/morning in your local time zone. No fixed hour or exact execution-time promise. $99 one-time for 52 weeks from successful activation; maximum 1,300 prospects per installation.`,
    reassurance: "No manual searching. No duplicate restaurant locations. No CRM required.",
    qualificationCopy: "Require an identifiable, active restaurant business operating a permanent food-service location in the assigned region, with an attributable, verifiable official website demonstrating currently operating restaurant services. Include independent restaurants; restaurant chains and franchise locations; full-service restaurants; quick-service and fast-casual restaurants; cafÃ©s and coffee shops serving prepared food or drinks; pizzerias, bakeries with food-service operations, and specialty restaurants; casual, fine-dining, and family restaurants; and food-service establishments operating identifiable permanent locations. Do not prioritize cuisine, brand, ownership model, size or price segment. Verify identifiable business identity, current operating status, physical location in the assigned territory, and attributable official restaurant website evidence. A proposed location, name or directory listing alone is insufficient. Individual chain or franchise locations may qualify separately when they have distinct physical locations and identifiable official location pages. Use the actual official location page or attributable independent restaurant website, preserving its canonical location-specific path or identifying parameters. A shared chain, brand, franchise or operator domain alone must not merge distinct qualifying locations. A generic brand homepage without verified location identity, address and operating evidence, or a third-party delivery listing, is insufficient. Do not invent a standalone location website. Exclude grocery stores without meaningful restaurant operations; food wholesalers and distributors; delivery-only listing pages without verifiable operating businesses; catering-only businesses without restaurant operations; temporary pop-ups; unverified or inactive establishments; directories, review websites and third-party delivery platforms. Do not weaken these criteria to fill the quota. Count identifiable operating restaurant locations, not brand offices, corporate entities, listings or delivery channels. Before every run and immediately before writing, read Restaurants records across all regions in the entire customer Prospects sheet. Compare location identity, verified address, known aliases or former names, ownership/operator relationships and canonical official location URLs. The same physical restaurant location with different names, operators, brands or websites remains one prospect. Do not treat locations as duplicates merely because they share a chain, franchise, operator or domain. Do not add a group/brand office as an extra prospect alongside its already recorded locations or double-count the same restaurant through group and location records. If distinct location identity cannot be verified, do not add a duplicate. Changing Region never makes a location new. Other customer types remain separate assignments. Email, Phone and Notes are customer-owned. No email discovery, automated outreach or CRM integration is included. ",
  };
}

for (const assignment of miloAssignments.filter(item => item.agentId === "healthcare")) {
  const source = miloPresentations[`milo-${assignment.regionId}-distributors`];
  miloPresentations[assignment.slug] = { ...source, demo: undefined,
    headline: "Up to 5 qualified healthcare practices per scheduled weekday, when available.",
    description: `Milo finds active outpatient medical and dental practices at verified offices in ${assignment.region} and adds verified prospects to your shared Google spreadsheet. Monday-Friday, flexible AM/morning in your local time zone. No fixed hour or exact execution-time promise. $99 one-time for 52 weeks from successful activation; maximum 1,300 prospects per installation.`,
    reassurance: "No manual searching. No duplicate practice offices. No CRM required.",
    qualificationCopy: "Include general medical and primary care, family medicine, internal medicine, medical specialties, outpatient clinics, urgent care and pediatrics; general dentistry, orthodontics, periodontics, endodontics, oral and maxillofacial surgery, and other legitimate medical and dental specialties. Do not prioritize medical over dental practices or particular specialties. Require active outpatient practices, verified regional office locations and attributable, verified official websites. Multilocation practices may qualify through distinct, verifiable offices with identifiable official location pages. Shared practice groups, health systems or domains alone do not merge distinct offices. Deduplicate office identity, address, aliases and canonical official URLs across regions; clinicians and specialties at the same office do not create extra prospects. Exclude hospitals without separately identifiable qualifying outpatient practices, pharmacies and medical supply stores, medical equipment distributors, insurance companies, directories and appointment-booking platforms, and inactive or unverifiable practices. Hospital-affiliated practices require separately verifiable practice identity, outpatient services, office location and official evidence. No email discovery, outbound contact or CRM integration.",
  };
}
