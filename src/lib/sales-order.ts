import { geographicRegions, projectRegions, type RegionId } from "./geographic-regions";
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
    ["architects", "Architects"], ["property-managers", "Property Management Companies"],
    ["hoas", "Homeowners Associations (HOAs)"], ["distributors", "Distributors"], ["hotels", "Hotels & Resorts"],
    ["restaurants", "Restaurants"], ["healthcare", "Healthcare Practices"], ["municipalities", "Municipalities / Public Agencies"],
  ].map(([id, customerType]) => id === "healthcare" ? { id, name: "Milo", customerType, description: "Finds up to 5 verified outpatient medical or dental practice offices per scheduled weekday in your selected region. Flexible customer-local mornings; $99 one-time for 52 weeks, maximum 1,300 prospects.", regionBased: true, activeRegions: miloAssignments.filter(a => a.agentId === "healthcare" && a.available).map(a => a.regionId) } : id === "restaurants" ? { id, name: "Milo", customerType, description: "Finds up to 5 verified active restaurant locations per scheduled weekday in your selected region. Flexible customer-local mornings; $99 one-time for 52 weeks, maximum 1,300 prospects.", regionBased: true, activeRegions: miloAssignments.filter(a => a.agentId === "restaurants" && a.available).map(a => a.regionId) } : id === "hotels" ? { id, name: "Milo", customerType, description: "Finds up to 5 verified operating lodging properties per scheduled weekday in your selected region. Flexible customer-local mornings; $99 one-time for 52 weeks, maximum 1,300 prospects.", regionBased: true, activeRegions: miloAssignments.filter(a => a.agentId === "hotels" && a.available).map(a => a.regionId) } : id === "distributors" ? { id, name: "Milo", customerType, description: "Finds up to 5 verified B2B distributors per scheduled weekday in your selected region. Flexible customer-local mornings; $99 one-time for 52 weeks, maximum 1,300 prospects.", regionBased: true, activeRegions: miloAssignments.filter(a => a.agentId === "distributors" && a.available).map(a => a.regionId) } : id === "hoas" ? { id, name: "Milo", customerType, description: "Finds up to 5 verified community associations per scheduled weekday in your selected region. Flexible customer-local mornings; $99 one-time for 52 weeks, maximum 1,300 prospects.", regionBased: true, activeRegions: miloAssignments.filter(a => a.agentId === "hoas" && a.available).map(a => a.regionId) } : id === "property-managers" ? { id, name: "Milo", customerType, description: "Finds up to 5 qualified property management companies each weekday in your selected region. Every weekday morning, in your local time zone. $99 one-time for 52 weeks; maximum 1,300 prospects per installation.", regionBased: true, activeRegions: miloAssignments.filter(a => a.agentId === "property-managers" && a.available).map(a => a.regionId) } : id === "landscaping" ? { id, name: "Milo", customerType, description: "Finds up to 5 qualified landscaping companies per weekday, Monday-Friday, in your selected region. $99 one-time for 52 weeks; maximum 1,300 prospects per installation.", regionBased: true, activeRegions: miloAssignments.filter(a => a.agentId === "landscaping" && a.available).map(a => a.regionId) } : id === "architects" ? { id, name: "Milo", customerType, description: "Finds 5 qualified architectural firms per weekday, Monday-Friday, in your selected region. $99 one-time for 52 weeks; maximum 1,300 prospects per installation.", regionBased: true, activeRegions: miloAssignments.filter(a => a.agentId === "architects" && a.available).map(a => a.regionId) } : id === "builders" ? { id: "builders", name: "Milo", customerType: "Builders / Homebuilders", description: "Finds 1 qualified production homebuilder or established residential community developer per weekday across the United States. $99 one-time for 52 weeks; maximum 260 companies.", regionBased: false, activeRegions: ["united-states" as const] } : ({ id, customerType, description: `Finds qualified ${customerType.toLowerCase()} in your selected regions and keeps the prospect list organized.`, regionBased: true, activeRegions: [] })),
  { id: "projects-developments", name: "Milo", customerType: "Projects & Developments", description: "Early alerts for projects entering site plan or subdivision review. Weekly, flexible mornings in your local time zone; $99 per state for 52 weeks. Coverage is selective and zero-project weeks are acceptable. Uses a separate shared project spreadsheet.", regionBased: true, activeRegions: miloAssignments.filter(a => a.agentId === "projects-developments" && a.available).map(a => a.regionId) },
  { id: "building-materials-manufacturers", name: "Milo", customerType: "U.S. Building Materials Manufacturers", description: "Finds up to 2 verified building materials manufacturers across the United States each Monday. Every week, in the morning, in your local time zone. One nationwide assignment; $99 for 52 weeks.", regionBased: false, activeRegions: ["united-states"] },
];
// Experimental workers are not public storefront offerings.
export const universalSalesWorkers: { id: string; name: string; active: boolean; regionBased: boolean; description: string }[] = [];
// Future checkout must revalidate this selection on the server and associate it
// with the customer's existing shared workspace, never a workspace per region.
export function createSalesOrder(assignmentKeys: string[], universalIds: string[]) {
  const discoveryAssignments = [...new Set(assignmentKeys)].map((key) => {
    const [agentId, regionId, extra] = key.split(":");
    const worker = salesWorkers.find((item) => item.id === agentId);
    const region = worker && !worker.regionBased && regionId === "united-states" ? { id: "united-states" as const, name: "United States", states: [] } : (agentId === "projects-developments" ? projectRegions : salesRegions).find((item) => item.id === regionId);
    if (extra !== undefined || !worker || !region || !worker.activeRegions.includes(region.id)) throw new Error("Unavailable Discovery assignment");
    return { agentId, customerType: worker.customerType, regionId: region.id, region: region.name, states: region.states.map((state) => state.code), amountCents: SALES_ASSIGNMENT_CENTS };
  });
  const universalWorkers = [...new Set(universalIds)].map((id) => {
    const worker = universalSalesWorkers.find((item) => item.id === id && item.active);
    if (!worker) throw new Error("Unavailable universal worker");
    return { id, name: worker.name, amountCents: SALES_ASSIGNMENT_CENTS };
  });
  return {
    version: 1, workspaceModel: discoveryAssignments.some(item => item.agentId === "projects-developments") ? "separate-shared-projects-and-sales-workspaces-per-customer" : "one-shared-sales-workspace-per-customer",
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
        (productSlugs.length === 1 ? `Secure $99 one-time payment for Milo â€” ${order.discoveryAssignments[0].region} ${order.discoveryAssignments[0].agentId === "projects-developments" ? "Projects & Developments" : order.discoveryAssignments[0].agentId === "healthcare" ? "Healthcare Practices" : order.discoveryAssignments[0].agentId === "restaurants" ? "Restaurants" : order.discoveryAssignments[0].agentId === "hotels" ? "Hotels & Resorts" : order.discoveryAssignments[0].agentId === "distributors" ? "Distributors" : order.discoveryAssignments[0].agentId === "hoas" ? "Homeowners Associations (HOAs)" : order.discoveryAssignments[0].agentId === "property-managers" ? "Property Management Companies" : order.discoveryAssignments[0].agentId === "landscaping" ? "Landscaping Companies" : order.discoveryAssignments[0].agentId === "architects" ? "Architects" : order.discoveryAssignments[0].agentId === "builders" ? "Production Homebuilders & Developers" : order.discoveryAssignments[0].agentId === "building-materials-manufacturers" ? "Building Materials Manufacturers" : order.discoveryAssignments[0].agentId === "general-contractors" ? "General Contractors" : order.discoveryAssignments[0].agentId === "electrical" ? "Electrical" : order.discoveryAssignments[0].agentId === "plumbing" ? "Plumbing" : order.discoveryAssignments[0].agentId === "hvac" ? "HVAC" : "Roofing"} through Stripe.` :
          `Secure $${order.totalCents / 100} one-time payment for your selected Discovery regions through Stripe.`) :
        "Select one or more available Discovery regions to hire Milo. Only available agents can be hired.",
    };
  } catch {
    return { order: createSalesOrder([], []), canCheckout: false, productSlug: undefined, productSlugs: [],
      status: "Only available agents can be hired. Remove Coming Soon or unavailable selections to continue." };
  }
}
