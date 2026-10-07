"use client";
import { Fragment, useState } from "react";
import Link from "next/link";
import { AgentFitAuditCallout } from "./agent-fit-audit";
import { salesWorkers, salesCheckoutState, SALES_ASSIGNMENT_CENTS } from "@/lib/sales-order";
import RegionalAssignmentSelector from "./regional-assignment-selector";
import styles from "./sales-workers.module.css";

export default function SalesGrowthPage({ miloCheckoutEnabled }: { miloCheckoutEnabled: boolean }) {
  const [assignments, setAssignments] = useState<string[]>([]);
  const { order, canCheckout, status, productSlugs } = salesCheckoutState(assignments, [], miloCheckoutEnabled);
  function toggle(key: string, selected: string[], update: (value: string[]) => void) {
    update(selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key]);
  }
  return <div className={`page-width ${styles.page}`}>
    <header className={styles.header}><h1>Agents specialized in Sales</h1></header>
    <div className={styles.video}><p>Sales agents explainer video coming soon</p></div>
    <div className={styles.layout}><div>
      <section aria-labelledby="discovery-title">
        <div className={styles.sectionHeading}><h2 id="discovery-title">Prospect Discovery Agents</h2>
          <p>Choose the customer types and coverage you want your agents to research.</p>
          <p>$99 per selected assignment · 52 weeks from successful activation.</p></div>
        <div className={styles.grid}>{salesWorkers.map((worker, index) => <Fragment key={worker.id}>
          {(index === 0 || index === 9) && <div className={styles.auditRow}><AgentFitAuditCallout /></div>}
          <article className={styles.card}>
          <div className={styles.art}><span>PROSPECT DISCOVERY</span><strong>{worker.id === "roofing" ? "Milo Roofing" : worker.name ?? worker.customerType}</strong><small>Agent artwork coming soon</small></div>
          <div className={styles.cardBody}>
            <span className={worker.activeRegions.length ? styles.available : styles.soon}>{!worker.regionBased ? "Available nationwide · United States" : worker.activeRegions.length ? "Available in Florida, Texas, California, Northeast, Southeast, Midwest, Southwest, Mountain West and Pacific Northwest" : "Coming soon"}</span>
            <h3>{worker.name ? `${worker.name} · ${worker.customerType}` : worker.customerType}</h3><p>{worker.description}</p>
            {worker.regionBased ? <RegionalAssignmentSelector product={worker} selectedKeys={assignments} onToggle={(key) => toggle(key, assignments, setAssignments)} priceCents={SALES_ASSIGNMENT_CENTS} /> : <>
              <p><Link href="/products/milo-us-building-materials-manufacturers">Explore Milo — U.S. Building Materials Manufacturers</Link></p>
              <label><input type="checkbox" checked={assignments.includes(`${worker.id}:united-states`)} onChange={() => toggle(`${worker.id}:united-states`, assignments, setAssignments)} /> Select nationwide assignment · $99</label>
            </>}
          </div></article></Fragment>)}<div className={styles.auditRow}><AgentFitAuditCallout /></div></div>
      </section>
      </div>
      <aside className={styles.summary} aria-labelledby="order-title"><h2 id="order-title">Your Sales team</h2>
        <div aria-live="polite" aria-atomic="true"><h3>Selected Discovery assignments</h3>
          {order.discoveryAssignments.length ? <ul>{order.discoveryAssignments.map((item) => <li key={`${item.agentId}:${item.regionId}`}><span>{item.customerType}<small>{item.region}</small></span><strong>$99</strong></li>)}</ul> : <p>Select an available assignment to start.</p>}
          <div className={styles.summaryTerm}><strong>52-week term</strong><p>Each assignment starts from successful activation.</p></div>
          <div className={styles.total}><span>Total</span><strong>${order.totalCents / 100}</strong></div></div>
        <form action={canCheckout ? "/api/checkout/milo" : undefined} method="post" onSubmit={(event) => { if (!canCheckout) event.preventDefault(); }}>
          {productSlugs.map(slug => <input key={slug} type="hidden" name="product" value={slug} />)}
          <button type="submit" className={styles.hire} disabled={!canCheckout} aria-describedby="sales-checkout-status">Hire these agents</button>
        </form>
        <p id="sales-checkout-status" className={styles.checkoutStatus}>{status}</p>
        <p className={styles.workspace}>One customer, one shared Sales prospect workspace. All Discovery agents feed it.</p>
      </aside></div>
  </div>;
}
