import Link from "next/link";
import { Check } from "lucide-react";
import { salesPaths, type DiscoveryProduct } from "@/lib/sales-catalog";
import type { MiloPresentation } from "@/lib/milo-presentations";
import MiloDemo from "./milo-demo";
import styles from "./milo-product.module.css";

export default function MiloProductPage({ product, presentation }: {
  product: DiscoveryProduct;
  presentation: MiloPresentation;
}) {
  return (
    <div className={`page-width ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href={salesPaths.category}>Sales &amp; Growth</Link><span>/</span>
        <Link href={salesPaths.discovery}>Find New Customers</Link><span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className={styles.content}>
        <header className={styles.identity}>
          <p className="eyebrow">FIND NEW CUSTOMERS</p>
          <h1>{product.name}</h1>
          <p className={styles.subtitle}>{product.subtitle}</p>
        </header>
        <section className={styles.message} aria-labelledby="milo-message">
          <h2 id="milo-message">{presentation.headline}</h2>
          <p className={styles.description}>{presentation.description}</p>
          <p className={styles.reassurance}>{presentation.reassurance}</p>
        </section>
        <MiloDemo demo={presentation.demo} />
        <section className={styles.deliverables} aria-labelledby="milo-deliverables">
          <h2 id="milo-deliverables">{presentation.deliverablesHeading}</h2>
          <p>{presentation.deliverablesCopy}</p>
          <ul className={styles.fields}>{presentation.fields.map((field) => <li key={field}><Check size={17} aria-hidden="true" />{field}</li>)}</ul>
          <p>{presentation.qualificationCopy}</p>
        </section>
        <section className={styles.purchase} aria-labelledby="milo-purchase">
          <div>
            <p className="eyebrow">ONE-TIME PAYMENT</p>
            <h2 id="milo-purchase">Price to be confirmed</h2>
            <p>Purchase availability coming next.</p>
          </div>
          <div className={styles.purchaseAction}>
            <button className="button" disabled aria-describedby="checkout-status">Buy Now</button>
            <small id="checkout-status">Unavailable until checkout is ready.</small>
          </div>
        </section>
        <section className={styles.installation} aria-labelledby="milo-installation">
          <h2 id="milo-installation">What happens after purchase?</h2>
          <ol className={styles.steps}>{presentation.installationSteps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span><p>{step}</p></li>)}</ol>
        </section>
      </div>
    </div>
  );
}
