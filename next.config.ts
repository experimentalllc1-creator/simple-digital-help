import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  // Private server bundle only: never copy paid assets into public/ or a client import.
  outputFileTracingExcludes: {
    "/*": ["./docs/Products/MILO/Archive/**/*", "./docs/Products/MILO/Milo_FL_Roofing_Product_Spec_v2.2.md", "./docs/Products/MILO/Milo_Installation_Video_v2.2.mp4"],
  },
  outputFileTracingIncludes: {
    "/api/checkout/milo": ["./docs/Products/MILO/Milo_FL_Roofing_Installation_Prompt_v2.2.txt","./docs/Products/MILO/Milo_Illustrated_Installation_Guide_v2.2.pdf"],
    "/api/webhooks/stripe": ["./docs/Products/MILO/Milo_FL_Roofing_Installation_Prompt_v2.2.txt","./docs/Products/MILO/Milo_Illustrated_Installation_Guide_v2.2.pdf"],
  },
};
export default config;
