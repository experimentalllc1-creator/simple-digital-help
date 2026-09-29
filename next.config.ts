import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  // Private server bundle only: never copy paid assets into public/ or a client import.
  outputFileTracingIncludes: {
    "/api/checkout/milo": ["./docs/Products/MILO/*"],
    "/api/webhooks/stripe": ["./docs/Products/MILO/*"],
  },
};
export default config;
