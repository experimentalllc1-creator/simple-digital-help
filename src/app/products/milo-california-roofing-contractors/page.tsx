import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { publishedDiscoveryProducts } from "@/lib/sales-catalog";
import { miloPresentations } from "@/lib/milo-presentations";
import MiloProductPage from "@/components/milo-product-page";

export const metadata: Metadata = { title: "Milo | Automated Prospect Discovery - California Roofing Contractors" };

export default async function MiloPage() {
  await connection();
  const product = publishedDiscoveryProducts.find((item) => item.slug === "milo-california-roofing-contractors");
  const presentation = product && miloPresentations[product.slug];
  if (!product || !presentation) notFound();
  return <MiloProductPage product={product} presentation={presentation} />;
}
