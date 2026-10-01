import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { installationTypes, marketingAgents, marketingContact, marketingGroups, marketingPaths, marketingPlaceholders, type MarketingGroup } from "@/lib/marketing-catalog";
import shared from "./sales-growth.module.css";
import styles from "./marketing.module.css";

export function MarketingCategoryPage() {
  return (
    <div className={`page-width ${shared.page}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Marketing &amp; Content</span></nav>
      <header className={shared.intro}>
        <p className="eyebrow">{marketingPlaceholders.eyebrow}</p>
        <h1>Marketing &amp; Content</h1>
        <p>{marketingPlaceholders.introduction}</p>
      </header>
      <div className={styles.placeholder}>{marketingPlaceholders.icon}</div>
      <section className={shared.section} aria-labelledby="marketing-paths">
        <h2 id="marketing-paths">What do you need help with?</h2>
        <div className={shared.cards}>
          {Object.values(marketingGroups).map((group) => (
            <Link key={group.href} href={group.href} className={`${shared.card} ${shared.active}`}>
              <span className={shared.cardLabel}>EXPLORE <ArrowRight size={19} aria-hidden="true" /></span>
              <h3>{group.title}</h3><p>{group.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function MarketingAgentPage({ group }: { group: MarketingGroup }) {
  const path = marketingGroups[group];
  return (
    <div className={`page-width ${shared.page}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={marketingPaths.category}>Marketing &amp; Content</Link><span>/</span><span aria-current="page">{path.title}</span></nav>
      <header className={shared.intro}><p className="eyebrow">MARKETING &amp; CONTENT</p><h1>{path.title}</h1><p>{path.description}</p></header>
      <div className={`${styles.placeholder} ${styles.video}`} aria-label={`${path.title} video placeholder`}>{marketingPlaceholders.video}</div>
      <div className={styles.grid}>
        {marketingAgents.filter((agent) => agent.group === group).map((agent) => {
          const installation = installationTypes[agent.installation];
          return agent.installation === "diy" ? (
            <details className={styles.agent} key={agent.id}>
              <summary><span className={styles.badge}>{installation.label}</span><h2>{agent.name}</h2></summary>
              <p className={styles.unavailable}>No product available for this selection yet.</p>
              <p>{installation.description}</p>
              <div className={`${styles.placeholder} ${styles.image}`}>{marketingPlaceholders.imagery}</div>
            </details>
          ) : (
            <article className={styles.agent} key={agent.id}>
              <span className={styles.badge}>{installation.label}</span><h2>{agent.name}</h2>
              <p>{installation.description}</p>
              <div className={`${styles.placeholder} ${styles.image}`}>{marketingPlaceholders.imagery}</div>
              <a className="button button-dark" href={`${marketingContact}?subject=${encodeURIComponent(`Setup: ${agent.name}`)}`} aria-label={`Contact Us about ${agent.name}`}>Contact Us <ArrowRight size={17} aria-hidden="true" /></a>
            </article>
          );
        })}
      </div>
    </div>
  );
}