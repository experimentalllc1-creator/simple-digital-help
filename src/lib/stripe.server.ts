import "server-only";
import Stripe from "stripe";
import { paymentConfig } from "./milo-config.server";

export function stripeClient() {
  return new Stripe(paymentConfig().secretKey, { timeout: 10_000, maxNetworkRetries: 1 });
}
