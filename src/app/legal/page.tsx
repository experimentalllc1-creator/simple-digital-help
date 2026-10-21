import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./legal.module.css";

export const metadata: Metadata = { title: "Legal" };

export default function LegalPage() {
  return (
    <section className={`page-width ${styles.page}`}>
      <h1>Legal</h1>
      <ul className={styles.links}>
        {[["privacy", "Privacy Policy"], ["terms", "Terms of Service"], ["disclaimers", "Product & AI Disclaimers"]].map(([slug, title]) => (
          <li key={slug}>
            <Link href={`/legal/${slug}`}>{title}<ArrowUpRight size={20} aria-hidden="true" /></Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
