"use client";
import { LegalAcceptance } from "./legal-acceptance";
import { useRef, useState, type FormHTMLAttributes } from "react";

export function useCheckoutTab() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  async function open(createCheckout: () => Promise<string>) {
    if (locked.current) return;
    locked.current = true;
    setError(""); setFallbackUrl("");
    let tab: Window | null = null;
    try {
      // Reserve the tab during the click/submit, before awaiting the server.
      tab = window.open("about:blank", "_blank");
      if (!tab) throw new Error("Your browser blocked the checkout tab. Allow pop-ups for this site, then try again. No checkout was started.");
      tab.opener = null;
      tab.document.title = "Opening secure checkout";
      tab.document.body.textContent = "Opening secure checkout…";
      setBusy(true);
      const url = new URL(await createCheckout(), window.location.origin);
      if (url.origin !== "https://checkout.stripe.com" && !(url.origin === window.location.origin && ["/checkout/milos", "/agent-fit-audit/report"].includes(url.pathname))) throw new Error("The checkout destination is unavailable. Please try again.");
      if (tab.closed) {
        setFallbackUrl(url.href);
        setError("The checkout tab was closed. Use the link below to open the same checkout; no new session is needed.");
      } else {
        try { tab.location.replace(url.href); }
        catch { setFallbackUrl(url.href); setError("The checkout tab could not navigate. Open the same checkout using the link below."); }
      }
    } catch (e) {
      if (tab && !tab.closed) tab.close();
      setError(e instanceof Error ? e.message : "Checkout could not open. Please try again.");
    } finally { locked.current = false; setBusy(false); }
  }
  return { open, busy, error, fallbackUrl };
}
export function CheckoutStatus({ checkout }: { checkout: ReturnType<typeof useCheckoutTab> }) {
  return <>{checkout.busy && <p role="status">Opening checkout in a new tab…</p>}{checkout.error && <p role="alert">{checkout.error}</p>}{checkout.fallbackUrl && <p><a href={checkout.fallbackUrl} target="_blank" rel="noopener noreferrer">Open the same checkout in a new tab</a></p>}</>;
}
export function CheckoutForm({ children, onSubmit, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  const [accepted, setAccepted] = useState(false);
  const checkout = useCheckoutTab();
  return <form {...props} aria-busy={checkout.busy} onSubmit={event => {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    if (!accepted || !event.currentTarget.reportValidity()) { event.preventDefault(); return; }
    event.preventDefault();
    const form = event.currentTarget;
    void checkout.open(async () => {
      const response = await fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Checkout is temporarily unavailable. Please try again.");
      if (typeof result.url !== "string") throw new Error("Checkout did not return a payment page. Please try again.");
      return result.url;
    });
  }}><LegalAcceptance checked={accepted} onChange={setAccepted} /><fieldset disabled={!accepted || checkout.busy} style={{border:0,padding:0,margin:0,minWidth:0}}>{children}</fieldset><CheckoutStatus checkout={checkout} /></form>;
}
