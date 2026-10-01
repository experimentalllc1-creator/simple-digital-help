import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { discoveryProductPath, discoveryProductTitle, featuredDiscoveryProduct, salesPaths } from "@/lib/sales-catalog";
import styles from "./sales-growth.module.css";

export default function SalesGrowthPage() {
  return (
    <div className={`page-width ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><span aria-current="page">Sales &amp; Growth</span>
      </nav>
      <header className={styles.intro}>
        <p className="eyebrow">STOP BUYING SYSTEMS. START SOLVING PROBLEMS.</p>
        <h1>Sales &amp; Growth</h1>
        <p>Inside this category you will find a catalog of small AI agents that bring consistency to the sales work that often gets neglected. Each AI agent handles one specific job, from finding prospects to first contact and follow-up. Start with one and expand later at your own pace and according to your real needs. They are designed to work together.</p>
      </header>
      <section className={styles.explanation} aria-label="Sales tasks our agents can help with">
        <Image className={styles.iceberg} src="/images/categories/sales-growth-iceberg.webp" width={800} height={800} loading="eager" unoptimized alt="An iceberg with A at the tip, B above the waterline, and a much larger C below the surface." />
        <div>
          <div className={styles.marketList}>
            <div className={styles.market}><span className={styles.letter}>A</span><div>
              <h2>Need to find new prospects?</h2>
              <p>One of our agents can take care of that, day in and day out.</p>
            </div></div>
            <div className={styles.market}><span className={styles.letter}>B</span><div>
              <h2>Having trouble making that first contact?</h2>
              <p>Let one of our agents do it for you.</p>
            </div></div>
            <div className={styles.market}><span className={styles.letter}>C</span><div>
              <h2>Is follow-up the problem?</h2>
              <p>One of our agents can take care of that as well.</p>
            </div></div>
          </div>
          <p className={styles.summary}>Use only the help you need, or combine agents so the work can move from one step to the next.</p>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="sales-needs">
        <h2 id="sales-needs">What do you need help with?</h2>
        <div className={styles.cards}>
          <Link className={`${styles.card} ${styles.active}`} href={salesPaths.discovery}>
            <span className={styles.cardLabel}>EXPLORE <ArrowRight size={19} aria-hidden="true" /></span>
            <h3>Find New Customers</h3>
            <p>Find potential customers in the industries and geographic markets you want to reach.</p>
          </Link>
          <div className={`${styles.card} ${styles.future}`}>
            <span className={styles.cardLabel}>COMING LATER</span>
            <h3>Contact &amp; Follow Up</h3>
            <p>Help with initial contact and keeping conversations moving.</p>
          </div>
          <div className={`${styles.card} ${styles.future}`}>
            <span className={styles.cardLabel}>COMING LATER</span>
            <h3>Quotes &amp; Proposals</h3>
            <p>Help preparing, organizing and following up on sales proposals.</p>
          </div>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="featured-product">
        <h2 id="featured-product">Featured Product</h2>
        <div className={styles.feature}>
          <div><h3>{discoveryProductTitle(featuredDiscoveryProduct)}</h3><p>Discover the first Milo variation. Full product details are coming next.</p></div>
          <Link className="button button-dark" href={discoveryProductPath(featuredDiscoveryProduct)}>View Product <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
