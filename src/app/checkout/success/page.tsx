import Link from "next/link";

export const metadata = { title: "Milo checkout", robots: { index: false, follow: false } };

export default function CheckoutSuccess() {
  return <div className="page-width" style={{ paddingBlock: 64 }}>
    <h1>Thank you for choosing Milo</h1>
    <p>After your payment is verified, your Milo v1.2 files and installation video link will be emailed to the address you entered at checkout.</p>
    <p>Check your inbox and spam folder. If the email does not arrive, contact <a href="mailto:support@simpledigitalhelp.com">support@simpledigitalhelp.com</a>.</p>
    <Link className="button" href="/products/milo-florida-roofing-contractors">Return to Milo</Link>
  </div>;
}
