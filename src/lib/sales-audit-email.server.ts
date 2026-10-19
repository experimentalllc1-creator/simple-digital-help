import "server-only";
import { miloEmail } from "./milo-assets.server";
export async function auditMiloEmail(email: string, sessionId: string, productCode: string, version: string,
  quote: { subtotalCents: number; savingsCents: number; creditCents: number; totalCents: number }, count: number) {
  const message = await miloEmail(email, sessionId, productCode, version);
  const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  return { ...message, text: [
    `Your order includes ${count} Milo assignment${count === 1 ? "" : "s"} in one checkout. This email contains only this assignment's installation files.`,
    `Whole-basket subtotal: ${dollars(quote.subtotalCents)}. Volume savings: ${dollars(quote.savingsCents)}. Audit credit: ${dollars(quote.creditCents)}. Total paid for the whole basket: ${dollars(quote.totalCents)}.`,
    message.text.replace("$99 one-time per state", "Included in your basket purchase"),
  ].join("\n\n") };
}
