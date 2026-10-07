import Link from "next/link";

export const metadata = { title: "Milo checkout", robots: { index: false, follow: false } };

export default function CheckoutSuccess() {
  return <div className="page-width" style={{ paddingBlock: 64 }}>
    <h1>Payment successful — thank you for choosing Milo</h1>
    <p>After payment verification, your Milo v2.4 installation materials will be sent to the email address used during checkout. The email contains only the installation prompt and illustrated installation guide as attachments.</p>
    <p>Your 52 weeks of service start only after successful activation. Check your spam/junk folder if the email does not arrive shortly. If the email does not arrive, contact <a href="mailto:support@simpledigitalhelp.com">support@simpledigitalhelp.com</a>.</p>
    <Link className="button" href="/products/milo-florida-roofing-contractors">Return to Milo</Link>
  </div>;
}
