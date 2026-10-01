import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  SectionHeading,
} from "@/components/storefront";
import styles from "./page.module.css";
import { marketingPlaceholders } from "@/lib/marketing-catalog";

export const metadata: Metadata = {
  title: { absolute: "Simple Digital Help — Small helpers. Big possibilities." },
};

export default function Home() {
  return (
    <>
      <section className={`hero page-width ${styles.hero}`}>
        <div className="hero-copy">
          <p className="eyebrow">SMALL HELPERS. BIG POSSIBILITIES.</p>
          <h1>
            Stop buying systems.
            <br /><span>Start solving problems.</span>
          </h1>
          <p className="hero-description">
            Small digital workers that bring consistency to the everyday tasks that keep your business moving. Prospecting, first contact, follow-ups and more. Day in, day out. No procrastination, no excuses. Just results.
          </p>
          <Link href="#categories" className={`button button-dark ${styles.cta}`}>
            <span>Explore solutions for everyday business tasks</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="page-width" aria-label="Explainer video">
        <div className={styles.videoPlaceholder}>
          <p>Explainer video coming soon</p>
        </div>
      </section>
      <section className="section page-width categories-section" id="categories">
        <SectionHeading
          eyebrow="A PLACE FOR EVERY KIND OF WORK"
          title="Find help where you need it."
        />
        <div className={styles.categoryPanels}>
          <Link href="/categories/sales" className={styles.categoryPanel} id="sales-growth" aria-labelledby="sales-heading">
            <h3 className={`${styles.categoryHeading} ${styles.salesHeading}`} id="sales-heading">
              Sales &amp; Growth
              <ArrowUpRight size={22} aria-hidden="true" />
            </h3>
            <Image
              className={styles.categoryVisual}
              src="/images/categories/sales-growth-iceberg.webp"
              width={800}
              height={800}
              unoptimized
              alt="An iceberg showing three market layers: A at the tip, B above the waterline, and a much larger C beneath the surface."
            />
            <div className={styles.categoryContent}>
              <p className={styles.categoryPromise}>Go beyond the market you already reach.</p>
              <div className={styles.categoryLegend}>
                <p>
                  <strong>A — The market you already serve</strong>
                  <span>Customers, relationships, referrals, and opportunities already within reach.</span>
                </p>
                <p>
                  <strong>B — The market you actively pursue</strong>
                  <span>Companies you find through prospecting, networking, events, lists, and manual research.</span>
                </p>
                <p>
                  <strong>C — The market you rarely reach</strong>
                  <span>The much larger pool that requires consistent, ongoing discovery, week after week.</span>
                </p>
              </div>
              <p className={styles.categorySummary}>
                A is already within reach. Good sales teams work hard to pursue B. Milo opens the door to C.
              </p>
            </div>
          </Link>
          <Link href="/categories/marketing" className={styles.categoryPanel} id="marketing-content" aria-labelledby="marketing-heading">
            <h3 className={`${styles.categoryHeading} ${styles.salesHeading}`} id="marketing-heading">Marketing &amp; Content <ArrowUpRight size={22} aria-hidden="true" /></h3>
            <div className={styles.marketingPlaceholder}>
              <p>{marketingPlaceholders.icon}</p>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
