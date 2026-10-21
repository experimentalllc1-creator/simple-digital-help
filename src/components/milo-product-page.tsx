import MiloBeforeYouBuy from "./milo-before-you-buy";
import { CheckoutForm } from "./checkout-in-new-tab";
import Link from "next/link";
import { Check } from "lucide-react";
import { salesPaths, type DiscoveryProduct } from "@/lib/sales-catalog";
import type { MiloPresentation } from "@/lib/milo-presentations";
import MiloDemo from "./milo-demo";
import styles from "./milo-product.module.css";
import { checkoutEnabled } from "@/lib/milo-config.server";
import { miloAssignments } from "@/lib/milo-assignments";
import { storefrontPricingEnabled } from "@/lib/milo-storefront-http.server";

export default function MiloProductPage({ product, presentation }: {
  product: DiscoveryProduct;
  presentation: MiloPresentation;
}) {
  const canBuy = checkoutEnabled() && miloAssignments.some(assignment => assignment.slug === product.slug && assignment.available);
  const isProjects = product.industry === "Projects & Developments";
  const volumePricing = storefrontPricingEnabled();
  return (
    <div className={`page-width ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href={salesPaths.category}>Sales &amp; Growth</Link><span>/</span>
        <Link href={isProjects ? salesPaths.opportunities : salesPaths.discovery}>{isProjects ? "Find New Opportunities" : "Find New Customers"}</Link><span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className={styles.content}>
        <header className={styles.identity}>
          <p className="eyebrow">{isProjects ? "FIND NEW OPPORTUNITIES" : "FIND NEW CUSTOMERS"}</p>
          <h1>{product.name}</h1>
          <p className={styles.subtitle}>{product.subtitle}</p>
        </header>
        <section className={styles.message} aria-labelledby="milo-message">
          <h2 id="milo-message">{presentation.headline}</h2>
          <p className={styles.description}>{presentation.description}</p>
          <p className={styles.reassurance}>{presentation.reassurance}</p>
        </section>
        {presentation.demo && <MiloDemo demo={presentation.demo} />}
        <section className={styles.deliverables} aria-labelledby="milo-deliverables">
          <h2 id="milo-deliverables">{presentation.deliverablesHeading}</h2>
          <p>{presentation.deliverablesCopy}</p>
          <ul className={styles.fields}>{presentation.fields.map((field) => <li key={field}><Check size={17} aria-hidden="true" />{field}</li>)}</ul>
          <p>{presentation.qualificationCopy}</p>
        </section>
        <MiloBeforeYouBuy industry={product.industry} region={product.region} schedule={isProjects ? "Milo researches publicly available development information weekly, in flexible local mornings. Discoveries are selective; zero-project weeks are possible, and no minimum discoveries or immediate identification is promised." : product.slug === "milo-us-building-materials-manufacturers" ? "Milo researches publicly available business information and is designed to identify up to two qualified manufacturers per weekly Monday run, in the morning in your local time zone, when available." : "Milo researches publicly available business information and is designed to identify up to five qualified prospects per scheduled workday, Monday–Friday in the morning in your local time zone, when available."} />
        <section className={styles.purchase} aria-labelledby="milo-purchase">
          <div>
            <p className="eyebrow">ONE-TIME PAYMENT</p>
            <h2 id="milo-purchase">$99</h2>
            <p>52 weeks of service from successful activation.</p>
            <p>{canBuy ? "Milo v2.4 installation prompt and illustrated guide delivered by email after payment." : "Purchase availability coming next."}</p>
          </div>
          <div className={styles.purchaseAction}>
            <CheckoutForm action="/api/checkout/milo" method="post">
              <input type="hidden" name="product" value={product.slug} />
              <button className="button" disabled={!canBuy} aria-describedby="checkout-status">Buy Now</button>
            </CheckoutForm>
            <small id="checkout-status">{canBuy ? "Secure one-time payment through Stripe." : "Unavailable until checkout is ready."}</small>
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
