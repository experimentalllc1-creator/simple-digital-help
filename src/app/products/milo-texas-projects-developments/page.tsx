import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { miloAssignments } from "@/lib/milo-assignments";
import { discoveryProducts } from "@/lib/sales-catalog";
import { miloPresentations } from "@/lib/milo-presentations";
import MiloProductPage from "@/components/milo-product-page";

export const metadata: Metadata = { title: "Milo – Projects & Developments | Texas" };
export default async function MiloPage() {
  await connection();
  const slug = "milo-texas-projects-developments";
  if (!miloAssignments.some(item => item.slug === slug && item.available)) notFound();
  const product = discoveryProducts.find(item => item.slug === slug);
  const presentation = miloPresentations[slug];
  if (!product || !presentation) notFound();
  return <MiloProductPage product={product} presentation={presentation} />;
}
