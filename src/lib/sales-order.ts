import { geographicRegions, type RegionId } from "./geographic-regions";
import { miloAssignments } from "./milo-assignments";
export const salesRegions = geographicRegions;
export const SALES_ASSIGNMENT_CENTS = 9900;
export const salesWorkers: { id: string; customerType: string; name?: string; description: string; regionBased: boolean; activeRegions: (RegionId | "united-states")[] }[] = [
  { id: "roofing", customerType: "Roofing Contractors", name: "Milo", description: "Finds new qualified roofing contractors consistently and keeps the prospect list organized.", regionBased: true, activeRegions: miloAssignments.filter(item => item.agentId === "roofing" && item.available).map(item => item.regionId) },
  { id: "hvac", customerType: "HVAC Contractors", name: "Milo HVAC", description: "Finds new qualified HVAC contractors consistently and keeps the prospect list organized.", regionBased: true, activeRegions: miloAssignments.filter(item => item.agentId === "hvac" && item.available).map(item => item.regionId) },
  { id: "plumbing", customerType: "Plumbing Contractors", name: "Milo Plumbing", description: "Finds new qualified plumbing contractors consistently and keeps the prospect list organized.", regionBased: true, activeRegions: miloAssignments.filter(item => item.agentId === "plumbing" && item.available).map(item => item.regionId) },
  { id: "electrical", customerType: "Electrical Contractors", name: "Milo Electrical", description: "Finds new qualified electrical contractors consistently and keeps the prospect list organized.", regionBased: true, activeRegions: miloAssignments.filter(item => item.agentId === "electrical" && item.available).map(item => item.regionId) },
  { id: "general-contractors", customerType: "General Contractors", name: "Milo General Contractors", description: "Finds new qualified general contractors consistently and keeps the prospect list organized.", regionBased: true, activeRegions: miloAssignments.filter(item => item.agentId === "general-contractors" && item.available).map(item => item.regionId) },
  ...[
    ["landscaping", "Landscaping Companies"],
    ["builders", "Builders / Homebuilders"],
    ["architects", "Architects"], ["property-managers", "Property Managers"],
    ["hoas", "HOAs"], ["distributors", "Distributors"], ["hotels", "Hotels / Resorts"],
    ["restaurants", "Restaurants"], ["medical", "Medical Practices"],
    ["dental", "Dental Practices"], ["municipalities", "Municipalities / Public Agencies"],
  ].map(([id, customerType]) => ({ id, customerType, description: `Finds qualified ${customerType.toLowerCase()} in your selected regions and keeps the prospect list organized.`, regionBased: true, activeRegions: [] })),
  { id: "projects-developments", customerType: "Projects & Developments", description: "Finds new construction, major renovations, expansions, capital improvements, and other significant projects that may create sales opportunities in your selected market.", regionBased: true, activeRegions: [] },
  { id: "building-materials-manufacturers", name: "Milo", customerType: "U.S. Building Materials Manufacturers", description: "Finds up to 2 verified building materials manufacturers across the United States each Monday at 9:00 AM customer local time. One nationwide assignment; $99 for 52 weeks.", regionBased: false, activeRegions: ["united-states"] },
];
// Experimental workers are not public storefront offerings.
export const universalSalesWorkers: { id: string; name: string; active: boolean; regionBased: boolean; description: string }[] = [];
// Future checkout must revalidate this selection on the server and associate it
// with the customer's existing shared workspace, never a workspace per region.
export function createSalesOrder(assignmentKeys: string[], universalIds: string[]) {
  const discoveryAssignments = [...new Set(assignmentKeys)].map((key) => {
    const [agentId, regionId, extra] = key.split(":");
    const worker = salesWorkers.find((item) => item.id === agentId);
    const region = worker?.id === "building-materials-manufacturers" && regionId === "united-states" ? { id: "united-states" as const, name: "United States", states: [] } : salesRegions.find((item) => item.id === regionId);
    if (extra !== undefined || !worker || !region || !worker.activeRegions.includes(region.id)) throw new Error("Unavailable Discovery assignment");
    return { agentId, customerType: worker.customerType, regionId: region.id, region: region.name, states: region.states.map((state) => state.code), amountCents: SALES_ASSIGNMENT_CENTS };
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


// Each selected available Discovery assignment becomes its own Stripe line item.
export function salesCheckoutState(assignmentKeys: string[], universalIds: string[], checkoutEnabled: boolean) {
  try {
    const order = createSalesOrder(assignmentKeys, universalIds);
    const products = order.discoveryAssignments.map(assignment => miloAssignments.find(item =>
      item.available && item.agentId === assignment.agentId && item.regionId === assignment.regionId));
    const miloOnly = products.length > 0 && products.every(Boolean) && order.universalWorkers.length === 0;
    const productSlugs = miloOnly ? products.map(item => item!.slug) : [];
    return {
      order,
      canCheckout: checkoutEnabled && miloOnly,
      productSlugs,
      productSlug: productSlugs.length === 1 ? productSlugs[0] : undefined,
      status: !checkoutEnabled ? "Checkout is currently unavailable." : miloOnly ?
        (productSlugs.length === 1 ? `Secure $99 one-time payment for Milo — ${order.discoveryAssignments[0].region} ${order.discoveryAssignments[0].agentId === "building-materials-manufacturers" ? "Building Materials Manufacturers" : order.discoveryAssignments[0].agentId === "general-contractors" ? "General Contractors" : order.discoveryAssignments[0].agentId === "electrical" ? "Electrical" : order.discoveryAssignments[0].agentId === "plumbing" ? "Plumbing" : order.discoveryAssignments[0].agentId === "hvac" ? "HVAC" : "Roofing"} through Stripe.` :
          `Secure $${order.totalCents / 100} one-time payment for your selected Discovery regions through Stripe.`) :
        "Select one or more available Discovery regions to hire Milo. Only available agents can be hired.",
    };
  } catch {
    return { order: createSalesOrder([], []), canCheckout: false, productSlug: undefined, productSlugs: [],
      status: "Only available agents can be hired. Remove Coming Soon or unavailable selections to continue." };
  }
}
