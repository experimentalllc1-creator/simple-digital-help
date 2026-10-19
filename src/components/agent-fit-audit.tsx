import Link from "next/link";
import styles from "./agent-fit-audit.module.css";

export function AgentFitAuditCallout() {
  return <section className={styles.callout} aria-label="Agent Fit Audit">
    <div><h2>Not sure which agents fit your business?</h2>
      <p>Get a free Agent Fit Audit. Answer a short Sales questionnaire to immediately see available Milos that match your customer targets and territories. No payment or account is required.</p>
    </div>
    <Link className="button button-dark" href="/agent-fit-audit">Get an Agent Fit Audit</Link>
  </section>;
}

export function AgentFitAuditBottomLink() {
  return <p className={styles.bottomLink}><Link href="/agent-fit-audit">Still not sure which agents you need? Get an Agent Fit Audit.</Link></p>;
}
