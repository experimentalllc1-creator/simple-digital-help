export const agentFitAudit = {
  id: "agent-fit-audit",
  name: "Agent Fit Audit",
  priceCents: 19900,
  currency: "usd",
  creditCents: 9900,
  creditValidityDays: 30,
  creditStartsAt: "audit-delivery",
  creditScope: "agents-specifically-recommended-in-the-audit",
  refundCondition: "no-recommended-simple-digital-help-agent",
  checkoutStatus: "pending",
} as const;
