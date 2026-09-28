import type { Metadata } from "next";
import Link from "next/link";
import FindNewCustomers from "@/components/find-new-customers";
import { salesPaths } from "@/lib/sales-catalog";
import styles from "@/components/sales-growth.module.css";

export const metadata: Metadata = { title: "Find New Customers" };

export default function FindNewCustomersPage() {
  return (
    <div className={`page-width ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={salesPaths.category}>Sales &amp; Growth</Link><span>/</span><span aria-current="page">Find New Customers</span></nav>
      <header className={styles.intro}>
        <p className="eyebrow">SALES &amp; GROWTH</p>
        <h1>Find New Customers</h1>
        <p>Find businesses that could become your customers.</p>
      </header>
      <FindNewCustomers />
    </div>
  );
}
