import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedDiscoveryProducts, salesPaths } from "@/lib/sales-catalog";
import styles from "@/components/sales-growth.module.css";

export const metadata: Metadata = { title: "Milo | Automated Prospect Discovery - Florida Roofing Contractors" };

export default function MiloPage() {
  const product = publishedDiscoveryProducts.find((item) => item.slug === "milo-florida-roofing-contractors");
  if (!product) notFound();
  return (
    <div className={`page-width ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={salesPaths.category}>Sales &amp; Growth</Link><span>/</span><Link href={salesPaths.discovery}>Find New Customers</Link><span>/</span><span aria-current="page">Milo</span></nav>
      <header className={styles.intro}>
        <p className="eyebrow">FIND NEW CUSTOMERS</p>
        <h1>{product.name}</h1>
        <p>{product.subtitle}</p>
      </header>
      <section className={styles.placeholder} aria-label="Product details">
        <p>Full product details coming next.</p>
        <Link className="text-link" href={salesPaths.discovery}>Explore Find New Customers</Link>
      </section>
    </div>
  );
}
