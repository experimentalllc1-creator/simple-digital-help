export const salesRegions = [{ id: "florida", name: "Florida" }, { id: "texas", name: "Texas" }];
export const SALES_ASSIGNMENT_CENTS = 9900;
export const salesWorkers: { id: string; customerType: string; name?: string; description: string; activeRegions: string[] }[] = [
  { id: "roofing", customerType: "Roofing Contractors", name: "Milo", description: "Finds new qualified roofing contractors consistently and keeps the prospect list organized.", activeRegions: ["florida"] },
  ...[
    ["hvac", "HVAC Contractors"], ["plumbing", "Plumbing Contractors"],
    ["electrical", "Electrical Contractors"], ["landscaping", "Landscaping Companies"],
    ["general-contractors", "General Contractors"], ["builders", "Builders / Homebuilders"],
    ["architects", "Architects"], ["property-managers", "Property Managers"],
    ["hoas", "HOAs"], ["distributors", "Distributors"], ["hotels", "Hotels / Resorts"],
    ["restaurants", "Restaurants"], ["medical", "Medical Practices"],
    ["dental", "Dental Practices"], ["municipalities", "Municipalities / Public Agencies"],
  ].map(([id, customerType]) => ({ id, customerType, description: `Finds qualified ${customerType.toLowerCase()} in your selected regions and keeps the prospect list organized.`, activeRegions: [] })),
  { id: "projects-developments", customerType: "Projects & Developments", description: "Finds new construction, major renovations, expansions, capital improvements, and other significant projects that may create sales opportunities in your selected market.", activeRegions: [] },
];
export const universalSalesWorkers = [
  { id: "first-contact", name: "Universal First Contact Agent", active: false, description: "Finds an available public business email for new prospects, sends the approved first-contact message, records successful contact, and identifies prospects where a usable email could not be found." },
  { id: "follow-up", name: "Universal Follow-Up Agent", active: false, description: "Monitors the conversations handled by the Sales team and performs the configured follow-up work." },
];
// Future checkout must revalidate this selection on the server and associate it
// with the customer's existing shared workspace, never a workspace per region.
export function createSalesOrder(assignmentKeys: string[], universalIds: string[]) {
  const discoveryAssignments = [...new Set(assignmentKeys)].map((key) => {
    const [agentId, regionId, extra] = key.split(":");
    const worker = salesWorkers.find((item) => item.id === agentId);
    const region = salesRegions.find((item) => item.id === regionId);
    if (extra !== undefined || !worker || !region || !worker.activeRegions.includes(regionId)) throw new Error("Unavailable Discovery assignment");
    return { agentId, customerType: worker.customerType, regionId, region: region.name, amountCents: SALES_ASSIGNMENT_CENTS };
  });
  const universalWorkers = [...new Set(universalIds)].map((id) => {
    const worker = universalSalesWorkers.find((item) => item.id === id && item.active);
    if (!worker) throw new Error("Unavailable universal worker");
    return { id, name: worker.name, amountCents: SALES_ASSIGNMENT_CENTS };
  });
  return {
    version: 1, workspaceModel: "one-shared-sales-workspace-per-customer",
    termWeeks: 52, termStartsAt: "successful-activation", currency: "usd",
    discoveryAssignments, universalWorkers,
    firstContactSelected: universalWorkers.some((item) => item.id === "first-contact"),
    followUpSelected: universalWorkers.some((item) => item.id === "follow-up"),
    totalCents: (discoveryAssignments.length + universalWorkers.length) * SALES_ASSIGNMENT_CENTS,
  } as const;
}
