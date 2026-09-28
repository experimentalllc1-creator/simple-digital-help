import Link from "next/link";
import { notFound } from "next/navigation";
import { collections, products } from "@/lib/catalog";
import { ProductShelf, SectionHeading } from "@/components/storefront";
export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title:
      collections.find((c) => c.slug === slug)?.name || "Collection not found",
  };
}
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();
  return (
    <>
      <div className="browse-header page-width">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/#collections">Collections</Link>
          <span>/</span>
          <span>{collection.name}</span>
        </div>
        <div className={`collection-intro tone-${collection.tone}`}>
          <p className="eyebrow">{collection.eyebrow} · A CURATED COLLECTION</p>
          <h1>{collection.name}</h1>
          <p className="browse-description">{collection.description}</p>
        </div>
      </div>
      <section className="page-width collection-page-products">
        <SectionHeading
          title="A few good things, together."
          description="Explore each helper individually. All products are illustrative concepts."
        />
        <ProductShelf
          products={collection.ids.map((id) =>
            products.find((p) => p.slug === id)!,
          )}
        />
      </section>
      <div className="page-width">
        <Link href="/store" className="text-link">
          Discover all 24 helpers →
        </Link>
      </div>
    </>
  );
}
