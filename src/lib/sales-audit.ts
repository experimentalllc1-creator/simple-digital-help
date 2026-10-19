import { miloAssignments } from "./milo-assignments";
import { salesWorkers } from "./sales-order";
import { geographicRegions } from "./geographic-regions";
import { priceMiloBasket } from "./milo-pricing";

export const auditTargets = salesWorkers.filter(worker => miloAssignments.some(a => a.available && a.agentId === worker.id));
export type AuditAnswers = { targets: string[]; regions: string[]; newYork?: boolean };
export type Recommendation = { slug: string; productCode: string; name: string; coverage: string; nationwide: boolean; projects: boolean };
export function validateAuditAnswers(input: AuditAnswers, complete = true) {
  if (!input || !Array.isArray(input.targets) || !Array.isArray(input.regions) || (complete && (!input.targets.length || !input.regions.length)) ||
    input.targets.length > 16 || input.regions.length > 9 || new Set(input.targets).size !== input.targets.length || new Set(input.regions).size !== input.regions.length ||
    input.targets.some(id => !auditTargets.some(t => t.id === id)) || input.regions.some(id => !geographicRegions.some(r => r.id === id)) ||
    (input.newYork !== undefined && typeof input.newYork !== "boolean")) throw new Error("Select valid Sales targets and regions.");
  if (complete && input.targets.includes("projects-developments") && input.regions.includes("northeast") && typeof input.newYork !== "boolean") throw new Error("Confirm whether you operate in New York State.");
}
export function matchSalesAudit(input: AuditAnswers) {
  validateAuditAnswers(input);
  const recommendations: Recommendation[] = miloAssignments.filter(a => a.available && input.targets.includes(a.agentId) &&
    (a.regionId === "united-states" || input.regions.includes(a.regionId) ||
      (a.agentId === "projects-developments" && a.regionId === "new-york" && input.regions.includes("northeast") && input.newYork === true)))
    .map(a => ({ slug: a.slug, productCode: a.productCode, name: `Milo — ${auditTargets.find(t => t.id === a.agentId)!.customerType}`, coverage: a.region,
      nationwide: a.regionId === "united-states", projects: a.agentId === "projects-developments" }));
  const notes = input.targets.filter(id => !recommendations.some(r => miloAssignments.find(a => a.slug === r.slug)?.agentId === id)).map(id =>
    id === "projects-developments" ? "Projects & Developments covers Florida, Texas and New York only. No purchasable project assignment matches your selections." : `No available ${auditTargets.find(t => t.id === id)!.customerType} assignment matches your selected markets.`);
  const catalogSnapshot = miloAssignments.filter(a => a.available).map(a => ({ slug: a.slug, productCode: a.productCode, agentId: a.agentId, regionId: a.regionId }));
  return { recommendations, notes, catalogVersion: "sales-audit-v1/milo-2.4", catalogSnapshot };
}

export function auditBasket(slugs: string[], recommendations: Recommendation[], owned: string[], creditAvailable: boolean, tiersEnabled: boolean) {
  if (!Array.isArray(slugs) || !slugs.length || slugs.length > 100 || new Set(slugs).size !== slugs.length || slugs.some(slug =>
    owned.includes(slug) || !recommendations.some(r => r.slug === slug) || !miloAssignments.some(a => a.slug === slug && a.available))) throw new Error("Select distinct available recommended Milos.");
  return priceMiloBasket(slugs, owned, recommendations.map(r => r.slug), creditAvailable, tiersEnabled);
}
