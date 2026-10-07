import Link from "next/link";

export const metadata = { title: "Milo checkout", robots: { index: false, follow: false } };

export default function CheckoutSuccess() {
  return <div className="page-width" style={{ paddingBlock: 64 }}>
    <h1>Payment successful — thank you for choosing Milo</h1>
    <p>After payment verification, the Milo v2.4 installation TXT and illustrated PDF guide for every purchased assignment will be sent to the email address used during checkout.</p>
    <p>Each assignment includes 52 weeks of service from successful activation. Install each TXT in its own ChatGPT conversation and use the same Google account and shared Sales prospect spreadsheet.</p>
    <p>Check your spam/junk folder if the email does not arrive shortly. For help, contact <a href="mailto:support@simpledigitalhelp.com">support@simpledigitalhelp.com</a>.</p>
    <Link className="button" href="/categories/sales">Return to your Sales team</Link>
  </div>;
}
