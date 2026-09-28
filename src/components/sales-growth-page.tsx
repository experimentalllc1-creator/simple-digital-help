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
        <p className="eyebrow">MORE OPPORTUNITIES. ROOM TO GROW.</p>
        <h1>Sales &amp; Growth</h1>
        <p>There is more to your market than the businesses you already know. Find practical digital solutions to reach more opportunities and develop them consistently.</p>
      </header>
      <section className={styles.explanation} aria-label="Three layers of your market">
        <Image className={styles.iceberg} src="/images/categories/sales-growth-iceberg.webp" width={800} height={800} loading="eager" unoptimized alt="An iceberg with A at the tip, B above the waterline, and a much larger C below the surface." />
        <div>
          <div className={styles.marketList}>
            <div className={styles.market}><span className={styles.letter}>A</span><div>
              <h2>The market already being served</h2>
              <p>Your existing customers, established relationships and familiar opportunities. This is the visible tip: the part of the market already within reach.</p>
            </div></div>
            <div className={styles.market}><span className={styles.letter}>B</span><div>
              <h2>The market actively being pursued</h2>
              <p>The businesses you seek out through prospecting, networking, events, lists and manual research. Sales teams work hard to find these opportunities and move conversations forward.</p>
            </div></div>
            <div className={styles.market}><span className={styles.letter}>C</span><div>
              <h2>The market barely being reached</h2>
              <p>The much larger market beneath the surface: businesses you rarely reach, or do not reach at all. Finding them takes consistent discovery, beyond the names already on your list.</p>
            </div></div>
          </div>
          <p className={styles.summary}>Sales &amp; Growth products help you discover more of that market and develop opportunities consistently, from finding potential customers to contact, follow-up and proposals.</p>
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
