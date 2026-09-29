import "server-only";

export const MILO_SLUG = "milo-florida-roofing-contractors";
export const MILO_PATH = `/products/${MILO_SLUG}`;
export const MILO_VERSION = "1.2";
export const MILO_AMOUNT = 9900;
export const MILO_CURRENCY = "usd";

export function checkoutEnabled() {
  return process.env.MILO_CHECKOUT_ENABLED === "true" && deliveryEnabled();
}

export function deliveryEnabled() {
  return process.env.MILO_DELIVERY_ENABLED === "true";
}

export function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing configuration: ${name}`);
  return value;
}

export function paymentConfig() {
  const mode = process.env.STRIPE_MODE ?? "test";
  if (mode !== "test" && mode !== "live") throw new Error("Invalid Stripe mode");
  const secretKey = required("STRIPE_SECRET_KEY");
  if (!secretKey.startsWith(`sk_${mode}_`) && !secretKey.startsWith(`rk_${mode}_`)) {
    throw new Error("Stripe key and mode do not match");
  }
  const productId = required("STRIPE_MILO_PRODUCT_ID");
  const priceId = required("STRIPE_MILO_PRICE_ID");
  if (!/^prod_[A-Za-z0-9]+$/.test(productId) || !/^price_[A-Za-z0-9]+$/.test(priceId)) {
    throw new Error("Invalid existing Stripe product/price IDs");
  }
  return { secretKey, productId, priceId, livemode: mode === "live" };
}

export function appOrigin() {
  const url = new URL(required("APP_URL"));
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && local)) ||
      (process.env.STRIPE_MODE === "live" && (local || url.protocol !== "https:"))) {
    throw new Error("APP_URL must be a trusted HTTPS origin (HTTP localhost in test mode only)");
  }
  return url.origin;
}
