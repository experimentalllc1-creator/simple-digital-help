import type { Metadata } from "next";
import { SalesAuditJourney } from "@/components/sales-audit-journey";
import { checkoutEnabled } from "@/lib/milo-config.server";

export const metadata: Metadata = { title: "Agent Fit Audit" };

export default function AgentFitAuditPage() {
  return <SalesAuditJourney free miloCheckoutEnabled={checkoutEnabled()} />;
}
