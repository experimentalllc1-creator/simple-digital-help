import { miloAssignments } from "./milo-assignments";
export const MILO_VOLUME_POLICY = { version: "flat-99-v1", tiers: [[1, 9900]] } as const;
export function priceMiloBasket(slugs: string[], owned: string[] = [], creditSlugs: string[] = [], creditAvailable = false, tiers = true) {
  if (!Array.isArray(slugs) || !slugs.length || slugs.length > 100 || new Set(slugs).size !== slugs.length || slugs.some(slug => !miloAssignments.some(a => a.available && a.slug === slug))) throw new Error("Select distinct available Milos (maximum 100).");
  const effectiveQuantity = new Set([...owned, ...slugs]).size;
  const unitCents = 9900;
  const subtotalCents = unitCents * slugs.length;
  const creditCents = creditAvailable ? Math.min(9900, slugs.filter(s => creditSlugs.includes(s)).length * unitCents) : 0;
  let remaining = creditCents;
  const lines = slugs.map(slug => { const deduction = creditSlugs.includes(slug) ? Math.min(unitCents, remaining) : 0; remaining -= deduction; return { slug, amountCents: unitCents - deduction }; });
  return { effectiveQuantity, unitCents, subtotalCents, savingsCents: 9900 * slugs.length - subtotalCents, creditCents, totalCents: subtotalCents - creditCents, lines };
}
