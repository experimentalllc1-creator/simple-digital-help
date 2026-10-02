import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import styles from "./page.module.css";

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
      <section className="section page-width categories-section" id="categories" aria-label="Explore agents by category">
        <Image
          className={styles.categoryVisual}
          src="/images/agent-team-office.png"
          width={1448}
          height={1086}
          unoptimized
          alt="AI agents working together in an office."
        />
        <div className={styles.categoryLinks}>
          <Link href="/categories/sales" className={`button ${styles.categoryButton} ${styles.salesButton}`} id="sales-growth">
            Explore our agents specialized in Sales
          </Link>
          <Link href="/categories/marketing" className={`button ${styles.categoryButton} ${styles.marketingButton}`} id="marketing-content">
            Explore our agents specialized in Marketing
          </Link>
        </div>
      </section>
    </>
  );
}
