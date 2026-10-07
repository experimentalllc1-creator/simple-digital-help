import Link from "next/link";
export const metadata = { title: "Milo manufacturer checkout", robots: { index: false, follow: false } };
export default function CheckoutSuccess() {
  return <div className="page-width" style={{ paddingBlock: 64 }}>
    <h1>Payment successful — thank you for choosing Milo</h1>
    <p>After payment verification, your Milo v2.4 U.S. Building Materials Manufacturers installation TXT and illustrated PDF guide will be emailed to the address used at checkout.</p>
    <p>One nationwide assignment, up to 2 new qualified manufacturers per run, once per week on Monday at 9:00 AM customer local time. Your 52-week term starts at successful activation.</p>
    <p>Upload the TXT in a new ChatGPT conversation and follow the illustrated guide. Use your existing Google account and shared Sales prospect spreadsheet if you already use Milo. Existing Milo tasks keep their original schedules and expiration.</p>
    <p>Check spam/junk if the email does not arrive shortly. For help, contact <a href="mailto:support@simpledigitalhelp.com">support@simpledigitalhelp.com</a>.</p>
    <Link className="button" href="/products/milo-us-building-materials-manufacturers">Return to Milo — U.S. Building Materials Manufacturers</Link>
  </div>;
}
