import type { Metadata } from "next";
import Link from "next/link";
import FindNewOpportunities from "@/components/find-new-opportunities";
import { salesPaths } from "@/lib/sales-catalog";
import styles from "@/components/sales-growth.module.css";

export const metadata: Metadata = { title: "Find New Opportunities" };

export default function FindNewOpportunitiesPage() {
  return (
    <div className={`page-width ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={salesPaths.category}>Sales &amp; Growth</Link><span>/</span><span aria-current="page">Find New Opportunities</span></nav>
      <header className={styles.intro}>
        <p className="eyebrow">SALES &amp; GROWTH</p>
        <h1>Find New Opportunities</h1>
        <p>Find projects and developments that could create new sales opportunities.</p>
      </header>
      <FindNewOpportunities />
    </div>
  );
}