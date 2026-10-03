import type { Metadata } from "next";
import Link from "next/link";
import { agentFitAudit } from "@/lib/agent-fit-audit";
import styles from "@/components/agent-fit-audit.module.css";

export const metadata: Metadata = { title: "Agent Fit Audit" };

export default function AgentFitAuditPage() {
  return <div className={`page-width ${styles.page}`}>
    <header className={styles.header}>
      <h1>Agent Fit Audit</h1>
      <h2>Not sure which digital workers actually fit your business?</h2>
      <p>For $199, we review how your company handles recurring work, identify where Simple Digital Help agents can genuinely help, identify where they cannot, and give you a practical implementation plan.</p>
    </header>
    <div className={styles.purchase}>
      <button className="button button-dark" disabled aria-describedby="audit-checkout-status">Purchase Agent Fit Audit — ${agentFitAudit.priceCents / 100}</button>
      <p id="audit-checkout-status">Checkout activation remains pending. Purchase is currently unavailable.</p>
    </div>
    <section className={styles.panel} aria-labelledby="audit-deliverables">
      <h2 id="audit-deliverables">What you receive</h2>
      <ul>
        <li>Review of relevant business processes and recurring work</li>
        <li>Recommended Simple Digital Help agents</li>
        <li>Agents we specifically do not recommend</li>
        <li>Recommended order of implementation</li>
        <li>Practical implementation plan</li>
      </ul>
    </section>
    <section className={`${styles.panel} ${styles.guarantee}`} aria-labelledby="audit-guarantee">
      <h2 id="audit-guarantee">No suitable agent? Full refund.</h2>
      <p>If we cannot identify a single Simple Digital Help agent that we genuinely recommend for your business, we refund the full $199 audit fee.</p>
    </section>
    <section className={styles.panel} aria-labelledby="audit-credit">
      <h2 id="audit-credit">Put your audit toward your recommended agents</h2>
      <p>If we recommend agents, 50% of your audit fee becomes a credit toward the agents included in your recommended plan.</p>
      <strong className={styles.credit}>${agentFitAudit.creditCents / 100} credit toward recommended agents.</strong>
      <p>The credit applies only to agents specifically recommended in the audit. It is valid for {agentFitAudit.creditValidityDays} days from delivery of the audit.</p>
    </section>
    <section className={styles.panel} aria-labelledby="audit-optional">
      <h2 id="audit-optional">Prefer to choose for yourself?</h2>
      <p>You can browse and purchase Simple Digital Help agents directly without completing an audit.</p>
      <div className={styles.actions}><Link className="button button-dark" href="/categories/sales">Sales</Link><Link className="button button-dark" href="/categories/marketing">Marketing</Link></div>
    </section>
  </div>;
}
