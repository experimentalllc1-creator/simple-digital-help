"use client";
import { LegalAcceptance } from "./legal-acceptance";
import { TERMS_VERSION } from "@/lib/legal-version";
import { useEffect, useState } from "react";
import { auditTargets, auditBasket, matchSalesAudit, type Recommendation, type AuditAnswers } from "@/lib/sales-audit";
import { geographicRegions } from "@/lib/geographic-regions";
import RegionInfo from "./region-info";
import auditStyles from "./agent-fit-audit.module.css";
import journeyStyles from "./sales-audit-journey.module.css";
import { CheckoutForm, CheckoutStatus, useCheckoutTab } from "./checkout-in-new-tab";
const styles = { ...auditStyles, ...journeyStyles };
type State = { report: { recommendations: Recommendation[]; notes: string[] } | null; answers: AuditAnswers | null; deliveredAt: string | null; creditEligible: boolean; refundStatus: string; owned: string[]; tiersEnabled: boolean; identityVerified: boolean; bookingUrl: string | null; bookingStatus?: string; orderStatus: string | null; pendingProducts?: string[]; pendingQuote?: ReturnType<typeof auditBasket> | null };
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(cents / 100);
async function api(input?: object) {
  const response = await fetch("/api/sales-audit", input ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) } : { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Please try again shortly.");
  return result;
}
export function AuditPurchase({ enabled }: { enabled: boolean }) {
  const checkout = useCheckoutTab();
  return <div className={styles.purchase}><button className="button button-dark" disabled={!enabled || checkout.busy} onClick={async () => {
    await checkout.open(async () => (await api({ action: "purchase" })).url);
  }}>Purchase Agent Fit Audit — $199</button><p>{enabled ? "One-time secure Stripe checkout." : "Purchase is awaiting launch approval."}</p><CheckoutStatus checkout={checkout} /></div>;
}
export function SalesAuditJourney({ free = false, miloCheckoutEnabled = false }: { free?: boolean; miloCheckoutEnabled?: boolean }) {
  const [accepted, setAccepted] = useState(false);
  const [state, setState] = useState<State | null>(free ? { report: null, answers: null, deliveredAt: null, creditEligible: false, refundStatus: "none", owned: [], tiersEnabled: false, identityVerified: false, bookingUrl: null, orderStatus: null } : null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [targets, setTargets] = useState<string[]>([]); const [regions, setRegions] = useState<string[]>([]); const [newYork, setNewYork] = useState<boolean | undefined>();
  const [selected, setSelected] = useState<string[]>([]);
  const checkout = useCheckoutTab();
  async function refresh() { const next = await api(); setState(next); setSelected(current => current.filter(slug => next.report?.recommendations.some((r: Recommendation) => r.slug === slug) && !next.owned.includes(slug))); }
  useEffect(() => {
    if (free) return;
    let active = true;
    async function load() {
      try {
        const token = window.location.hash.slice(1);
        if (token) { window.history.replaceState(null, "", window.location.pathname); await api({ action: "restore", token }); }
        const result = await api(); if (active) { setState(result); setSelected((result.pendingProducts ?? []).filter((slug: string) => !result.owned.includes(slug))); setError(""); if (result.answers) { setTargets(result.answers.targets); setRegions(result.answers.regions); setNewYork(result.answers.newYork); } }
      } catch { if (active) setError("Your paid Audit is not available yet. Refresh after payment confirmation, or open the private access link in your purchase email."); }
    }
    void load(); return () => { active = false; };
  }, [free]);
  const hasState = !!state; const hasReport = !!state?.report;
  useEffect(() => {
    if (free || !hasState || hasReport) return;
    const timer = setTimeout(() => { void api({ action: "save", answers: { targets, regions, ...(newYork === undefined ? {} : { newYork }) } }).catch(() => setError("Draft could not be saved. Keep this page open and try submitting again.")); }, 600);
    return () => clearTimeout(timer);
  }, [free, hasState, hasReport, targets, regions, newYork]);
  function toggle(value: string, current: string[], update: (v: string[]) => void) { update(current.includes(value) ? current.filter(v => v !== value) : [...current, value]); }
  async function run(action: () => Promise<void>) { setBusy(true); setError(""); try { await action(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  const nyRequired = targets.includes("projects-developments") && regions.includes("northeast");
  const recs = state?.report?.recommendations ?? [];
  const availableRecs = recs.filter(rec => !state?.owned.includes(rec.slug));
  const quote = selected.length && state ? state.pendingQuote && JSON.stringify(selected) === JSON.stringify(state.pendingProducts) ? state.pendingQuote : auditBasket(selected, recs, state.owned, state.creditEligible, state.tiersEnabled) : null;
  return <div className={`page-width ${styles.page}`}><h1>{free ? "Agent Fit Audit" : "Your Sales Agent Fit Audit"}</h1>
    {free && <p>This free Sales questionnaire recommends available Milos for your customer targets and territories. No payment or account is required. Each Milo costs $99 if you choose to purchase.</p>}
    {error && <p role="alert">{error}</p>}
    {!state && <button className="button button-dark" disabled={busy} onClick={() => run(refresh)}>Check payment confirmation</button>}
    {state && !state.report && <form onSubmit={event => { event.preventDefault(); void run(async () => {
      const answers = { targets, regions, ...(nyRequired ? { newYork } : {}) };
      if (free) { const report = matchSalesAudit(answers); setState(current => ({ ...current!, report })); setSelected([]); }
      else { await api({ action: "submit", answers }); await refresh(); }
    }); }}>
      <p>Choose your customer targets and territories. You will immediately receive automated matches to available Sales Prospect Discovery Milos.</p>
      <fieldset className={styles.panel}><legend>Which types of businesses do you sell, or want to sell, your products or services to?</legend><div className={styles.options}>
        {auditTargets.map(target => <label key={target.id}><input type="checkbox" checked={targets.includes(target.id)} onChange={() => toggle(target.id, targets, setTargets)} /> {target.customerType}</label>)}
      </div></fieldset>
      <fieldset className={styles.panel}><legend>Where do you sell, or intend to sell?</legend><div className={styles.options}>
        {geographicRegions.map(region => <div key={region.id}><label><input type="checkbox" checked={regions.includes(region.id)} onChange={() => toggle(region.id, regions, setRegions)} /> {region.name}</label> <RegionInfo region={region} /></div>)}
      </div></fieldset>
      {nyRequired && <fieldset className={styles.panel}><legend>Do you operate in New York State?</legend><label><input type="radio" name="ny" required checked={newYork === true} onChange={() => setNewYork(true)} /> Yes</label> <label><input type="radio" name="ny" checked={newYork === false} onChange={() => setNewYork(false)} /> No</label></fieldset>}
      <button className="button button-dark" disabled={busy || !targets.length || !regions.length || (nyRequired && newYork === undefined)}>See my recommendations</button>
    </form>}
    {state?.report && <>
      <section className={styles.panel}><h2>Your automated matches</h2><p>These matches use your selected customer types and territories. They have not been reviewed by a person and do not assess deeper commercial fit.</p>
        {!free && <p>Audit delivered: {state.deliveredAt ? new Date(state.deliveredAt).toLocaleString() : "Pending"}.</p>}
        {!recs.length ? <><h3>No suitable available agent matches your selections.</h3>{!free && <p>Your full $199 refund {state.refundStatus === "completed" ? "has been recorded as completed" : "is awaiting owner approval and processing"}. No refund is claimed until it is confirmed.</p>}</> : <>
          <label><input type="checkbox" disabled={!availableRecs.length || availableRecs.length > 100} checked={!!availableRecs.length && selected.length === availableRecs.length} onChange={event => setSelected(event.target.checked ? availableRecs.map(r => r.slug) : [])} /> Select all recommended Milos</label>
          {recs.length > 100 && <p>Select up to 100 distinct assignments for one Stripe checkout.</p>}
          <div className={styles.recommendations}>{recs.map(rec => <label key={rec.slug} className={styles.recommendation}><span><input type="checkbox" disabled={state.owned.includes(rec.slug) || (selected.length >= 100 && !selected.includes(rec.slug))} checked={selected.includes(rec.slug)} onChange={() => toggle(rec.slug, selected, setSelected)} /> <strong>{rec.name}</strong> — {rec.coverage}{state.owned.includes(rec.slug) && " (Already purchased)"}</span>
            {rec.nationwide && <span>This list is nationwide and is not filtered to your selected regions.</span>}
            {rec.projects && <span>Project opportunities use a separate shared project workspace.</span>}
          </label>)}</div>
          <div aria-live="polite"><p>Selected Milos: {selected.length}</p>{quote && <>{free ? <strong>Total: {money(quote.totalCents)}</strong> : <><p>Total: {money(quote.subtotalCents)}</p>{quote.savingsCents > 0 && <p>You save {money(quote.savingsCents)}</p>}<p>Audit credit: −{money(quote.creditCents)}</p><strong>Net checkout total: {money(quote.totalCents)}</strong></>}</>}</div>
          {!free && <p>{state.creditEligible ? "One $99 credit is available for recommended agents until 30 days after Audit delivery. It is used only on a successful purchase." : "Audit credit is used, expired, or has less than 31 minutes remaining to complete secure checkout. No credit is applied."}</p>}
          {!free && <p>Every Milo costs $99, regardless of quantity or purchase history.</p>}
          {!free && !state.identityVerified && <p>Open the private access link in your Audit purchase email to verify your identity and purchase recommended Milos.</p>}
          {!free && <LegalAcceptance checked={accepted} onChange={setAccepted} />}
          {free ? <CheckoutForm action="/api/checkout/milo" method="post">
            {selected.map(slug => <input key={slug} type="hidden" name="product" value={slug} />)}
            <button className="button button-dark" disabled={busy || !selected.length || !miloCheckoutEnabled}>Buy selected Milos in one checkout</button>
          </CheckoutForm> : <button className="button button-dark" disabled={!accepted || busy || !selected.length || !state.identityVerified} onClick={() => run(async () => { await checkout.open(async () => (await api({ action: "checkout", slugs: selected, legalAccepted: accepted, termsVersion: TERMS_VERSION })).url); })}>Buy selected Milos in one checkout</button>}
          <CheckoutStatus checkout={checkout} />
          {state.orderStatus === "pending" && <button className="button button-dark" disabled={busy} onClick={() => run(async () => { await api({ action: "cancel" }); await refresh(); })}>Cancel pending checkout to change selection</button>}
          {state.orderStatus && <p role="status">{state.orderStatus === "delivered" ? "Your selected installation packages have been sent." : state.orderStatus === "delivery_pending" ? "Payment confirmed. Package delivery is still pending; fulfillment will retry." : state.orderStatus === "pending" ? "A checkout is pending. Resume the same selection or cancel it to choose again." : `Order status: ${state.orderStatus}`}</p>}
        </>}
        {state.report.notes.map(note => <p key={note}>{note}</p>)}
        {free && <button className="button button-dark" onClick={() => { setState(current => ({ ...current!, report: null })); setSelected([]); setError(""); }}>Change answers</button>}
      </section>
      {!free && state.identityVerified && <section className={styles.panel}><h2>Optional consultation</h2>{state.bookingStatus === "booked" ? <p>Your included 15-minute consultation is booked. Use your scheduler confirmation to reschedule the same appointment.</p> : <><p>Still not sure? Your Audit includes a 15-minute consultation with us.</p><button type="button" className="button button-dark" disabled={busy} onClick={() => run(async () => { const result = await api({ action: "book" }); window.location.assign(result.url); })}>Book it here.</button></>}<p>Booking is optional. You can purchase your recommendations without a call.</p></section>}
      {!free && <button className="button button-dark" disabled={busy} onClick={() => run(refresh)}>Refresh payment and delivery status</button>}
    </>}
  </div>;
}
