import type { Metadata } from "next";
import { Header, Footer } from "@/components/storefront";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Simple Digital Help — A little help. A lot of possibility.",
    template: "%s | Simple Digital Help",
  },
  description:
    "Thoughtfully made digital helpers for the everyday work of running a business. Explore the Simple Digital Help design preview.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
