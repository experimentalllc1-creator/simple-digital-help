import type { Metadata } from "next";
import CatalogBrowser from "@/components/catalog-browser";
export const metadata: Metadata = { title: "Shop all digital helpers" };
export default async function Store({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <>
      <div className="browse-header page-width">
        <p className="eyebrow">THE SIMPLE DIGITAL HELP STORE</p>
        <h1>
          A little help for
          <br />
          just about every day.
        </h1>
        <p className="browse-description">
          Thoughtful digital tools for the jobs on your list.
          <br />
          Start with what you need. See what’s possible.
        </p>
      </div>
      <CatalogBrowser
        key={q || ""}
        initialQuery={typeof q === "string" ? q : ""}
      />
    </>
  );
}
