import { marketingCommercialModels, marketingWorkers, type MarketingCommercialModel } from "@/lib/marketing-workers";
import { AgentFitAuditCallout, AgentFitAuditBottomLink } from "./agent-fit-audit";
import shared from "./sales-workers.module.css";
import styles from "./marketing-workers.module.css";

export default function MarketingWorkersPage() {
  return <div className={`page-width ${shared.page} ${styles.page}`}>
    <header className={shared.header}><h1>Agents specialized in Marketing</h1></header>
    <div className={`${shared.video} ${styles.video}`}><p>Marketing agents explainer video coming soon</p></div>
    <AgentFitAuditCallout />
    {(Object.keys(marketingCommercialModels) as MarketingCommercialModel[]).map((model) => {
      const commercial = marketingCommercialModels[model];
      return <section className={styles.section} key={model} aria-labelledby={`marketing-${model}`}>
        <div className={shared.sectionHeading}><h2 id={`marketing-${model}`}>{commercial.title}</h2>
          {commercial.description && <p>{commercial.description}</p>}</div>
        <div className={`${shared.grid} ${styles.grid}`}>{marketingWorkers.filter((worker) => worker.model === model).map((worker) =>
          <article className={`${shared.card} ${styles.card}`} key={worker.id}>
            <div className={`${shared.art} ${styles.art}`}><span>MARKETING AGENT</span><strong>{worker.name}</strong><small>Agent artwork coming soon</small></div>
            <div className={shared.cardBody}>
              <div className={styles.badges}><span className={styles.badge}>{commercial.badge}</span>{model === "one-time" && <span className={styles.badge}>DIY</span>}</div>
              <h3>{worker.name}</h3><p>{worker.description}</p>
              <div className={styles.commercial}><strong className={styles.price}>${commercial.priceCents / 100}</strong>
                {commercial.includesAssistedSetup && <span>Includes assisted setup</span>}
                <span>{commercial.termLabel}</span>
                <span className={styles.availability}>{worker.availability === "coming-soon" ? "Coming soon" : "Available"}</span>
              </div>
            </div>
          </article>)}</div>
      </section>;
    })}
    <AgentFitAuditBottomLink />
  </div>;
}
