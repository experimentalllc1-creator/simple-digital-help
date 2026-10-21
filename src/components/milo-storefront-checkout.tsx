"use client";
import { LegalAcceptance } from "./legal-acceptance";
import { TERMS_VERSION } from "@/lib/legal-version";
import { useEffect, useState } from "react";
import { miloAssignments } from "@/lib/milo-assignments";
import { salesWorkers } from "@/lib/sales-order";
import { priceMiloBasket } from "@/lib/milo-pricing";
import styles from "./agent-fit-audit.module.css";
import { CheckoutStatus, useCheckoutTab } from "./checkout-in-new-tab";
type State = { verified: boolean; owned?: string[]; creditEligible?: boolean; creditSlugs?: string[]; pendingProducts?: string[]; pendingQuote?: ReturnType<typeof priceMiloBasket>; orderStatus?: string; orderCreatedAt?: string };
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);
async function api(input?: object) {
  const response = await fetch("/api/checkout/milo-cart", input ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) } : { cache: "no-store" });
  const value = await response.json(); if (!response.ok) throw new Error(value.error ?? "Please try again."); return value;
}
function label(slug: string) { const a = miloAssignments.find(a => a.slug === slug)!; return `${salesWorkers.find(w => w.id === a.agentId)!.customerType} — ${a.region}`; }
export default function MiloStorefrontCheckout() {
  const [accepted, setAccepted] = useState(false);
  const checkout = useCheckoutTab();
  const [state, setState] = useState<State | null>(null); const [selected, setSelected] = useState<string[]>([]); const [email, setEmail] = useState("");
  const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const incoming = new URLSearchParams(window.location.search).getAll("product");
        if (incoming.length) { try { localStorage.setItem("sdh-milo-basket", JSON.stringify({ products: incoming, createdAt: Date.now() })); } catch { /* Checkout remains usable without local storage. */ } window.history.replaceState(null, "", window.location.pathname + window.location.hash); }
        const token = window.location.hash.slice(1); if (token) { window.history.replaceState(null, "", window.location.pathname); await api({ action: "restore", token }); }
        const result = await api();
        if (!active) return;
        setState(result);
        let stored: { products?: string[]; createdAt?: number } = {};
        try { stored = JSON.parse(localStorage.getItem("sdh-milo-basket") ?? "{}"); } catch { /* Ignore invalid local drafts. */ }
        const products = result.pendingProducts?.length ? result.pendingProducts : incoming.length ? incoming : stored.products ?? [];
        const alreadyDelivered = !incoming.length && ["delivered", "delivery_pending"].includes(result.orderStatus) && (stored.createdAt ?? 0) <= new Date(result.orderCreatedAt).getTime();
        setSelected(alreadyDelivered ? [] : [...new Set<string>(products)].filter(s => miloAssignments.some(a => a.slug === s && a.available)).slice(0, 100));
      } catch (e) { if (active) setError((e as Error).message); }
    }
    void load(); return () => { active = false; };
  }, []);
  async function run(action: () => Promise<void>) { setBusy(true); setError(""); try { await action(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  function update(products: string[]) { setSelected(products); try { localStorage.setItem("sdh-milo-basket", JSON.stringify({ products, createdAt: Date.now() })); } catch { /* Server reservation will still resume. */ } }
  const quote = selected.length && state?.verified ? state.pendingQuote && JSON.stringify(selected) === JSON.stringify(state.pendingProducts) ? state.pendingQuote : priceMiloBasket(selected, state.owned, state.creditSlugs, state.creditEligible) : null;
  return <main className={`page-width ${styles.page}`}><h1>Your Milo checkout</h1>
    <p>Every Milo assignment costs $99, regardless of quantity or purchase history. Any eligible Audit credit applies once to recommended assignments.</p>
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {state && !state.verified && <form className={styles.panel} onSubmit={event => { event.preventDefault(); void run(async () => { await api({ action: "verify-email", email }); setNotice("Open the private verification link in your email to continue. No purchase has been made."); }); }}>
      <label>Purchase email <input type="email" required maxLength={254} style={{maxWidth:"100%"}} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label><p>Verify the email used for your previous purchases so we can apply the correct cumulative price and any eligible Audit credit.</p><button className="button button-dark" disabled={busy}>Send verification link</button>
    </form>}
    <section className={styles.panel}><h2>Your assignments</h2>
      {selected.length ? <ul>{selected.map(slug => <li key={slug}>{label(slug)} <button type="button" disabled={busy} onClick={() => update(selected.filter(s => s !== slug))} aria-label={`Remove ${label(slug)}`}>Remove</button></li>)}</ul> : <p>Select a Milo assignment to begin.</p>}
      <label>Add an assignment <select style={{maxWidth:"100%",width:"100%"}} value="" disabled={selected.length >= 100} onChange={event => { if (event.target.value) update([...selected, event.target.value]); }}><option value="">Choose a Milo</option>{miloAssignments.filter(a => a.available && !selected.includes(a.slug)).map(a => <option key={a.slug} value={a.slug}>{label(a.slug)}</option>)}</select></label>
      {quote && <div aria-live="polite"><p>Selected Milos: {selected.length}</p><p>Total: {money(quote.subtotalCents)}</p>{quote.savingsCents > 0 && <p>You save {money(quote.savingsCents)}</p>}{quote.creditCents > 0 && <p>One-time Audit credit: −{money(quote.creditCents)} (recommended assignments only)</p>}<strong>Net checkout total: {money(quote.totalCents)}</strong></div>}
      <p>Payment and final eligibility are validated on the server. Each assignment receives its own installation prompt and guide.</p>
      <LegalAcceptance checked={accepted} onChange={setAccepted} />
      <button className="button button-dark" style={{maxWidth:"100%",whiteSpace:"normal"}} disabled={!accepted || busy || !selected.length || !state?.verified} onClick={() => run(async () => { await checkout.open(async () => (await api({ action: "checkout", slugs: selected, legalAccepted: accepted, termsVersion: TERMS_VERSION })).url); })}>Continue to secure Stripe checkout</button>
      <CheckoutStatus checkout={checkout} />
      {state?.orderStatus === "pending" && <button className="button button-dark" disabled={busy} onClick={() => run(async () => { await api({ action: "cancel" }); setState(await api()); })}>Cancel pending checkout to change selection</button>}
      {state?.orderStatus && <p role="status">{state.orderStatus === "delivered" ? "Your installation packages have been sent." : state.orderStatus === "delivery_pending" ? "Payment confirmed. Delivery is pending and will retry." : `Order status: ${state.orderStatus}`}</p>}
    </section>
    <button className="button button-dark" disabled={busy} onClick={() => run(async () => setState(await api()))}>Refresh verification and order status</button>
  </main>;
}
