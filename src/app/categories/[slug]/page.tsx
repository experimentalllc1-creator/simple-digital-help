import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, products } from "@/lib/catalog";
import { ProductArt } from "@/components/storefront";
import CatalogBrowser from "@/components/catalog-browser";
import SalesGrowthPage from "@/components/sales-growth-page";
import { MarketingCategoryPage } from "@/components/marketing-pages";
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.id === slug);
  return { title: slug === "sales" ? "Agents specialized in Sales" : category?.name || "Category not found" };
}
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.id === slug);
  if (!category) notFound();
  if (slug === "sales") return <SalesGrowthPage />;
  if (slug === "marketing") return <MarketingCategoryPage />;
  return (
    <>
      <div className="browse-header page-width">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/store">Shop all</Link>
          <span>/</span>
          <span>{category.name}</span>
        </div>
        <div className="category-intro">
          <div>
            <p className="eyebrow">HELP WITH {category.name.toUpperCase()}</p>
            <h1>{category.short}</h1>
            <p className="browse-description">{category.description}</p>
          </div>
          <ProductArt
            product={products.find((p) => p.category === category.id)!}
          />
        </div>
      </div>
      <CatalogBrowser category={category.id} />
    </>
  );
}
