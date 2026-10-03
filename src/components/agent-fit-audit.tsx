import Link from "next/link";
import styles from "./agent-fit-audit.module.css";

export function AgentFitAuditCallout() {
  return <section className={styles.callout} aria-label="Agent Fit Audit">
    <div><h2>Not sure which agents fit your business?</h2>
      <p>Get an Agent Fit Audit for $199. We review your business processes, recommend the Simple Digital Help agents that make sense, identify the ones we do not recommend, and provide a practical implementation plan.</p>
      <p className={styles.support}>If we cannot recommend a single Simple Digital Help agent for your business, your $199 audit fee is fully refunded.</p>
    </div>
    <Link className="button button-dark" href="/agent-fit-audit">Get an Agent Fit Audit</Link>
  </section>;
}

export function AgentFitAuditBottomLink() {
  return <p className={styles.bottomLink}><Link href="/agent-fit-audit">Still not sure which agents you need? Get an Agent Fit Audit.</Link></p>;
}
