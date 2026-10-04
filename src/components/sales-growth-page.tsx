"use client";
import { useState } from "react";
import { AgentFitAuditCallout, AgentFitAuditBottomLink } from "./agent-fit-audit";
import { salesWorkers, universalSalesWorkers, salesCheckoutState, SALES_ASSIGNMENT_CENTS } from "@/lib/sales-order";
import RegionalAssignmentSelector from "./regional-assignment-selector";
import styles from "./sales-workers.module.css";

export default function SalesGrowthPage({ miloCheckoutEnabled }: { miloCheckoutEnabled: boolean }) {
  const [assignments, setAssignments] = useState<string[]>([]);
  const [universals, setUniversals] = useState<string[]>([]);
  const { order, canCheckout, status } = salesCheckoutState(assignments, universals, miloCheckoutEnabled);
  function toggle(key: string, selected: string[], update: (value: string[]) => void) {
    update(selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key]);
  }
  return <div className={`page-width ${styles.page}`}>
    <header className={styles.header}><h1>Agents specialized in Sales</h1></header>
    <div className={styles.video}><p>Sales agents explainer video coming soon</p></div>
    <AgentFitAuditCallout />
    <div className={styles.layout}><div>
      <section aria-labelledby="discovery-title">
        <div className={styles.sectionHeading}><h2 id="discovery-title">Prospect Discovery Agents</h2>
          <p>Choose the customer types and regions you want your agents to research.</p>
          <p>$99 per selected customer type and region · 52 weeks from successful activation.</p></div>
        <div className={styles.grid}>{salesWorkers.map((worker) => <article className={styles.card} key={worker.id}>
          <div className={styles.art}><span>PROSPECT DISCOVERY</span><strong>{worker.name ?? worker.customerType}</strong><small>Agent artwork coming soon</small></div>
          <div className={styles.cardBody}>
            <span className={worker.activeRegions.length ? styles.available : styles.soon}>{worker.activeRegions.length ? "Available in Florida" : "Coming soon"}</span>
            <h3>{worker.name ? `${worker.name} · ${worker.customerType}` : worker.customerType}</h3><p>{worker.description}</p>
            <RegionalAssignmentSelector product={worker} selectedKeys={assignments} onToggle={(key) => toggle(key, assignments, setAssignments)} priceCents={SALES_ASSIGNMENT_CENTS} />
            <small className={styles.term}>$99 × selected regions · 52 weeks each</small>
          </div></article>)}</div>
      </section>
      <section className={styles.addons} aria-labelledby="addons-title">
        <div className={styles.sectionHeading}><h2 id="addons-title">Universal Sales Agents</h2>
          <p>Hire each agent once. While active, it works across all your active Prospect Discovery agents in your shared Sales workspace, including regions added later.</p></div>
        <div className={styles.addonGrid}>{universalSalesWorkers.map((worker) => <article className={styles.card} key={worker.id}><div className={styles.cardBody}>
          <span className={worker.active ? styles.available : styles.soon}>{worker.active ? "Available" : "Coming soon"}</span>
          <h3>{worker.name}</h3><p>{worker.description}</p><p className={styles.price}>$99 <small>for 52 weeks</small></p>
          <label className={!worker.active ? styles.disabled : undefined}><input type="checkbox" checked={universals.includes(worker.id)} disabled={!worker.active} onChange={() => toggle(worker.id, universals, setUniversals)} /><span>{worker.active ? "Add to your Sales team" : "Coming soon"}</span></label>
        </div></article>)}</div>
      </section></div>
      <aside className={styles.summary} aria-labelledby="order-title"><h2 id="order-title">Your Sales team</h2>
        <div aria-live="polite" aria-atomic="true"><h3>Selected Discovery assignments</h3>
          {order.discoveryAssignments.length ? <ul>{order.discoveryAssignments.map((item) => <li key={`${item.agentId}:${item.regionId}`}><span>{item.customerType}<small>{item.region}</small></span><strong>$99</strong></li>)}</ul> : <p>Select an available region to start.</p>}
          <h3>Selected universal workers</h3>
          {order.universalWorkers.length ? <ul>{order.universalWorkers.map((item) => <li key={item.id}><span>{item.name}</span><strong>$99</strong></li>)}</ul> : <p>None selected.</p>}
          <div className={styles.summaryTerm}><strong>52-week term</strong><p>Each assignment starts from successful activation.</p></div>
          <div className={styles.total}><span>Total</span><strong>${order.totalCents / 100}</strong></div></div>
        <form action={canCheckout ? "/api/checkout/milo" : undefined} method="post" onSubmit={(event) => { if (!canCheckout) event.preventDefault(); }}>
          <button type="submit" className={styles.hire} disabled={!canCheckout} aria-describedby="sales-checkout-status">Hire these agents</button>
        </form>
        <p id="sales-checkout-status" className={styles.checkoutStatus}>{status}</p>
        <p className={styles.workspace}>One customer, one shared Sales prospect workspace. All Discovery agents feed it.</p>
      </aside></div>
    <AgentFitAuditBottomLink />
  </div>;
}
