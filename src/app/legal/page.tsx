import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./legal.module.css";

export const metadata: Metadata = { title: "Legal" };

export default function LegalPage() {
  return (
    <section className={`page-width ${styles.page}`}>
      <h1>Legal</h1>
      <p className={styles.notice}>
        Temporary source documents from the existing Right Hand / Simple Digital Help service.
        Their legal wording has been preserved and has not yet been revised for the Simple Digital Help Agent Store.
      </p>
      <ul className={styles.links}>
        {[["privacy", "Privacy Policy"], ["terms", "Terms of Service"], ["disclaimers", "Disclaimers"]].map(([slug, title]) => (
          <li key={slug}>
            <Link href={`/legal/${slug}`}>{title}<ArrowUpRight size={20} aria-hidden="true" /></Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
