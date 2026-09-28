import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publishedDiscoveryProducts } from "@/lib/sales-catalog";
import { miloPresentations } from "@/lib/milo-presentations";
import MiloProductPage from "@/components/milo-product-page";

export const metadata: Metadata = { title: "Milo | Automated Prospect Discovery - Florida Roofing Contractors" };

export default function MiloPage() {
  const product = publishedDiscoveryProducts.find((item) => item.slug === "milo-florida-roofing-contractors");
  const presentation = product && miloPresentations[product.slug];
  if (!product || !presentation) notFound();
  return <MiloProductPage product={product} presentation={presentation} />;
}
