"use client";
import { CheckoutForm } from "./checkout-in-new-tab";

import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AgentFitAuditCallout } from "./agent-fit-audit";
import { salesWorkers, salesCheckoutState, SALES_ASSIGNMENT_CENTS } from "@/lib/sales-order";
import RegionalAssignmentSelector from "./regional-assignment-selector";
import IllustrationVideo from "./illustration-video";
import styles from "./sales-workers.module.css";
import { projectRegions } from "@/lib/geographic-regions";
import { priceMiloBasket } from "@/lib/milo-pricing";

const cardNames: Record<string, string> = {
  roofing: "Milo Roofing",
  hvac: "Milo HVAC",
  plumbing: "Milo Plumbing",
  electrical: "Milo Electrical",
  "general-contractors": "Milo General Contractors",
  landscaping: "Milo Landscaping",
  builders: "Milo Homebuilders",
  architects: "Milo Architects",
  "property-managers": "Milo Property Managers",
  hoas: "Milo HOAs",
  distributors: "Milo Distributors",
  hotels: "Milo Hotels",
  restaurants: "Milo Restaurants",
  healthcare: "Milo Healthcare",
  "building-materials-manufacturers": "Milo Manufacturers",
  "projects-developments": "Milo Projects & Developments",
};

const cardDescriptions: Record<string, string> = {
  "roofing": "Hire Milo Roofing for a year and in that period he'll find up to 1,300 potential roofing contractor customers for your business.",
  "hvac": "Hire Milo HVAC for a year and in that period he'll find up to 1,300 potential HVAC contractor customers for your business.",
  "plumbing": "Hire Milo Plumbing for a year and in that period he'll find up to 1,300 potential plumbing contractor customers for your business.",
  "electrical": "Hire Milo Electrical for a year and in that period he'll find up to 1,300 potential electrical contractor customers for your business.",
  "general-contractors": "Hire Milo General Contractors for a year and in that period he'll find up to 1,300 potential general contractor customers for your business.",
  "landscaping": "Hire Milo Landscaping for a year and in that period he'll find up to 1,300 potential landscaping company customers for your business.",
  "builders": "Hire Milo Homebuilders for a year and in that period he'll find up to 260 potential homebuilder customers nationwide.",
  "architects": "Hire Milo Architects for a year and in that period he'll find up to 1,300 potential architecture firm customers for your business.",
  "property-managers": "Hire Milo Property Managers for a year and in that period he'll find up to 1,300 potential property management company customers for your business.",
  "hoas": "Hire Milo HOAs for a year and in that period he'll find up to 1,300 potential HOA customers for your business.",
  "distributors": "Hire Milo Distributors for a year and in that period he'll find potentially hundreds of new distributor branches in your selected region.",
  "hotels": "Hire Milo Hotels for a year and in that period he'll find up to 1,300 potential hotel and resort customers for your business.",
  "restaurants": "Hire Milo Restaurants for a year and in that period he'll find up to 1,300 potential restaurant customers for your business.",
  "healthcare": "Hire Milo Healthcare for a year and in that period he'll find up to 1,300 potential medical and dental practice customers for your business.",
  "building-materials-manufacturers": "Hire Milo Manufacturers for a year and in that period he'll find up to 100 potential manufacturer customers nationwide.",
  "projects-developments": "Hire Milo Projects for a year and he'll search weekly for new projects and developments, helping your business identify opportunities early, while there's still time to influence design and purchasing decisions."
};

const storefrontWorkers = salesWorkers
  .filter((worker) => worker.id !== "building-materials-manufacturers")
  .map((worker) => worker.id === "municipalities"
    ? salesWorkers.find((item) => item.id === "building-materials-manufacturers")!
    : worker);

export default function SalesGrowthPage({ miloCheckoutEnabled, volumePricingEnabled = false }: { miloCheckoutEnabled: boolean; volumePricingEnabled?: boolean }) {
  const [assignments, setAssignments] = useState<string[]>([]);
  const { order, canCheckout, status, productSlugs } = salesCheckoutState(assignments, [], miloCheckoutEnabled);
  const basketPrice = volumePricingEnabled && productSlugs.length && productSlugs.length <= 100 ? priceMiloBasket(productSlugs) : null;
  function toggle(key: string, selected: string[], update: (value: string[]) => void) {
    update(selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key]);
  }
  return <div className={`page-width ${styles.page}`}>
    <header className={styles.header}><h1>Agents specialized in Sales</h1></header>
    <link rel="preload" as="image" href="/images/sales-category-poster.webp" fetchPriority="high" />
    <div className={styles.video} style={{ padding: 0, overflow: "hidden" }}>
      <video controls playsInline preload="none" poster="/images/sales-category-poster.webp" onEnded={(event) => event.currentTarget.load()} aria-label="Sales Agents explainer video" style={{ display: "block", width: "100%", height: "100%", aspectRatio: "16 / 9", objectFit: "contain", background: "#000" }}>
        <source src="/videos/sales-category-optimized.mp4" type="video/mp4" />
        Your browser does not support video playback. <a href="/videos/sales-category-optimized.mp4">Download the Sales Agents explainer video</a>.
      </video>
    </div>
    <div className={styles.layout}><div>
      <a href="/images/how-to-hire-a-milo.png" target="_blank" rel="noopener noreferrer" aria-label="Open the How to hire a Milo guide at full size in a new tab" style={{ display: "block", marginBottom: 32, borderRadius: 12 }}>
        <Image src="/images/how-to-hire-a-milo.png" alt="How to hire a Milo: five steps to select, learn about, and purchase Sales Prospect Discovery agents." width={1672} height={941} unoptimized style={{ display: "block", width: "100%", height: "auto", borderRadius: 12 }} />
      </a>
      <section aria-labelledby="discovery-title">
        <div className={styles.sectionHeading}><h2 id="discovery-title">Prospect Discovery Agents</h2>
          <p>Choose the customer types and coverage you want your agents to research.</p>
          <p>$99 per selected assignment · 52 weeks from successful activation.</p></div>
        <div className={styles.grid}>{storefrontWorkers.map((worker, index) => <Fragment key={worker.id}>
          {(index === 0 || index === 9) && <div className={styles.auditRow}><AgentFitAuditCallout /></div>}
          <article className={`${styles.card} ${worker.id === "projects-developments" ? styles.finalRowCenter : ""}`}>
          {worker.id === "roofing" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Roofing%20Contractors%20Intro%20Video.mp4" title="Milo Roofing introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Cheerful Robot Roofer at Work.png" alt="Milo Roofing robot working on a roof" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "hvac" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20HVAC%20Intro%20Video.mp4" title="Milo HVAC introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Friendly Robot HVAC Technician at Work.png" alt="Milo HVAC robot servicing an air conditioner" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "plumbing" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Plumbing%20Intro%20Video%20.mp4" title="Milo Plumbing introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Robot Technician Servicing a Water Heater.png" alt="Milo Plumbing robot servicing a water heater" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "electrical" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Electrical%20Intro%20Video.mp4" title="Milo Electrical introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Friendly Robot Electrician at Work.png" alt="Milo Electrical robot working on an electrical panel" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "general-contractors" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20GC%20Intro%20Video.mp4" title="Milo General Contractors introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Robot Supervises a Sunny Construction Site.png" alt="Milo General Contractors robot supervising a construction site" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "landscaping" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Landscaping%20Video%20Intro.mp4" title="Milo Landscaping introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Milo Trims the Sunny Garden.png" alt="Milo Landscaping robot trimming a garden shrub" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "builders" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Home%20Builders%20Intro%20video.mp4" title="Milo Homebuilders introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Robot Reviews New Home Blueprints.png" alt="Milo Homebuilders robot reviewing new home blueprints" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "architects" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Architects%20intro%20video.mp4?v=764276776f4c" title="Milo Architects introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Robot Architect at Blueprint Desk.png" alt="Milo Architects robot reviewing plans at a blueprint desk" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "property-managers" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Property%20Manager%20Intro%20Video.mp4" title="Milo Property Managers introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Cheerful Robot Property Inspector at Modern Apartments.png" alt="Milo Property Managers robot inspecting modern apartments" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "hoas" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/1015%20%28Milo%20HOAs%20Intro%20Video%29.mp4" title="Milo HOAs introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Friendly HOA Robot at the Community Board.png" alt="Milo HOAs robot at a community notice board" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "distributors" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Distributor%20Intro%20Video.mp4?v=1c0165a004fa" title="Milo Distributors introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Friendly Robot Warehouse Inspector.png" alt="Milo Distributors robot inspecting a warehouse" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "hotels" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Hotels%20Intro%20Video.mp4" title="Milo Hotels introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Friendly Robot Concierge at a Tropical Resort.png" alt="Milo Hotels robot welcoming guests at a tropical resort" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "restaurants" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Restaurants%20Intro%20Video.mp4" title="Milo Restaurants introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Milo Welcomes Guests to the Bistro.png" alt="Milo Restaurants robot welcoming guests to a bistro" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "healthcare" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Healthcare%20Intro%20Video.mp4" title="Milo Healthcare introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Friendly Robot Welcomes Healthcare Visitors.png" alt="Milo Healthcare robot welcoming healthcare visitors" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "building-materials-manufacturers" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Manufacturers%20Intro%20Video.mp4?v=6d3ed0a6f000" title="Milo Manufacturers introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/Friendly Robot Factory Inspector.png" alt="Milo Manufacturers robot inspecting a factory" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : worker.id === "projects-developments" ? <IllustrationVideo src="/videos/Milo%20Intros%20Sales%20Page/Milo%20Projects%20Intro%20Video.mp4?v=ab8f2f9bd510" title="Milo Projects & Developments introduction">
            <div className={`${styles.art} ${styles.roofingArt}`}>
              <Image src="/images/agents/County PUD Approval Announcement.png" alt="Milo Projects & Developments county project approval announcement" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 33vw, 25vw" className={styles.roofingImage} />
              <span className={styles.roofingPlay} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M9 5v14l11-7z" /></svg></span>
            </div>
          </IllustrationVideo> : <div className={styles.art}><span>{worker.id === "projects-developments" ? "PROJECT DISCOVERY" : "PROSPECT DISCOVERY"}</span><strong>{cardNames[worker.id]}</strong><small>Agent artwork coming soon</small></div>}
          <div className={styles.cardBody}>
            <span className={worker.activeRegions.length ? styles.available : styles.soon}>{!worker.regionBased ? "Available nationwide · United States" : worker.activeRegions.length ? worker.id === "projects-developments" ? `Available in ${projectRegions.filter(region => worker.activeRegions.includes(region.id)).map(region => region.name).join(", ")}` : "Available in Florida, Texas, California, Northeast, Southeast, Midwest, Southwest, Mountain West and Pacific Northwest" : "Coming soon"}</span>
            <h3>{cardNames[worker.id]}</h3><p>{cardDescriptions[worker.id]}</p>
            {worker.regionBased ? <RegionalAssignmentSelector product={worker} selectedKeys={assignments} onToggle={(key) => toggle(key, assignments, setAssignments)} priceCents={SALES_ASSIGNMENT_CENTS} /> : <>
              <p><Link href={worker.id === "builders" ? "/products/milo-us-production-homebuilders-developers" : "/products/milo-us-building-materials-manufacturers"}>{worker.id === "builders" ? "Explore Milo – U.S. Production Homebuilders & Developers" : "Explore Milo — U.S. Building Materials Manufacturers"}</Link></p>
              <label><input type="checkbox" checked={assignments.includes(`${worker.id}:united-states`)} onChange={() => toggle(`${worker.id}:united-states`, assignments, setAssignments)} /> Select nationwide assignment · $99</label>
            </>}
          </div></article></Fragment>)}<div className={styles.auditRow}><AgentFitAuditCallout /></div></div>
      </section>
      </div>
      <aside className={styles.summary} aria-labelledby="order-title"><h2 id="order-title">Your Sales team</h2>
        <div aria-live="polite" aria-atomic="true"><h3>Selected Discovery assignments</h3>
          {order.discoveryAssignments.length ? <ul>{order.discoveryAssignments.map((item) => <li key={`${item.agentId}:${item.regionId}`}><span>{item.customerType}<small>{item.region}</small></span><strong>${(basketPrice?.unitCents ?? 9900) / 100}</strong></li>)}</ul> : <p>Select an available assignment to start.</p>}
          <div className={styles.summaryTerm}><strong>52-week term</strong><p>Each assignment starts from successful activation.</p></div>
          <div className={styles.total}><span>{volumePricingEnabled ? "Basket estimate" : "Total"}</span><strong>${(basketPrice?.totalCents ?? order.totalCents) / 100}</strong></div>{!!basketPrice?.savingsCents && <p>You save ${basketPrice.savingsCents / 100}</p>}</div>
        <CheckoutForm action={canCheckout ? "/api/checkout/milo" : undefined} method="post" onSubmit={(event) => { if (!canCheckout) event.preventDefault(); }}>
          {productSlugs.map(slug => <input key={slug} type="hidden" name="product" value={slug} />)}
          <button type="submit" className={styles.hire} disabled={!canCheckout || productSlugs.length > 100} aria-describedby="sales-checkout-status">Hire these agents</button>
        </CheckoutForm>
        <p id="sales-checkout-status" className={styles.checkoutStatus}>{productSlugs.length > 100 ? "Select at most 100 distinct assignments for one Stripe checkout." : volumePricingEnabled ? "Verify your purchase email in checkout for any eligible Audit credit." : status}</p>
        <p className={styles.workspace}>Sales agents share one prospect spreadsheet. Projects &amp; Developments uses a separate shared project spreadsheet.</p>
      </aside></div>
  </div>;
}
