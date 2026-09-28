"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import {
  categories,
  products,
  categoryFor,
  type CategoryId,
} from "@/lib/catalog";
import { ProductCard } from "./storefront";

export default function CatalogBrowser({
  category,
  initialQuery = "",
}: {
  category?: CategoryId;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [format, setFormat] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("curated");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const normalized = query.trim().toLowerCase();
  const terms = normalized.split(/\s+/).filter(Boolean);
  const results = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (format === "all" || p.format === format) &&
      (price === "all" ||
        (price === "under30" ? p.price < 30 : p.price >= 30)) &&
      terms.every((term) =>
        `${p.name} ${p.promise} ${categoryFor(p.category).name} ${p.input} ${p.deliverables.join(" ")}`
          .toLowerCase()
          .includes(term),
      ),
  );
  if (sort === "low") results.sort((a, b) => a.price - b.price);
  if (sort === "high") results.sort((a, b) => b.price - a.price);
  if (sort === "az") results.sort((a, b) => a.name.localeCompare(b.name));
  const clear = () => {
    setQuery("");
    setFormat("all");
    setPrice("all");
    window.history.replaceState(null, "", window.location.pathname);
  };
  const updateQuery = (value: string) => {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  };
  return (
    <div className="page-width">
      <form
        className="search-form catalog-search"
        id="catalog-search"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <Search size={20} strokeWidth={1.5} />
        <input
          aria-label="Search products"
          placeholder="What would you like a little help with?"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
        />
        <button aria-label="Search products" type="submit">
          <ArrowRight size={19} />
        </button>
      </form>
      <nav className="catalog-tabs" aria-label="Product categories">
        <Link
          className={!category ? "active" : ""}
          href="/store"
          aria-current={!category ? "page" : undefined}
        >
          All helpers
        </Link>
        {categories.map((c) => (
          <Link
            className={category === c.id ? "active" : ""}
            key={c.id}
            href={`/categories/${c.id}`}
            aria-current={category === c.id ? "page" : undefined}
          >
            {c.name}
          </Link>
        ))}
      </nav>
      <button
        className="mobile-filter-toggle"
        onClick={() => setFiltersOpen(!filtersOpen)}
        aria-expanded={filtersOpen}
        aria-controls="catalog-filters"
      >
        <SlidersHorizontal size={15} />
        {filtersOpen ? "Hide filters" : "Filter products"}
        {(format !== "all" || price !== "all") && " · Active"}
      </button>
      <div className="catalog-layout">
        <aside
          className={`catalog-sidebar ${filtersOpen ? "filters-open" : ""}`}
          id="catalog-filters"
        >
          <h2>A little more specific.</h2>
          <fieldset className="filter-group">
            <legend>Product format</legend>
            {[
              ["all", "All formats"],
              ["Guided workspace", "Guided workspaces"],
              ["Downloadable toolkit", "Downloadable toolkits"],
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="format"
                  value={value}
                  checked={format === value}
                  onChange={() => setFormat(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <fieldset className="filter-group">
            <legend>Illustrative price</legend>
            {[
              ["all", "Any price"],
              ["under30", "Under $30"],
              ["over30", "$30 and above"],
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="price"
                  value={value}
                  checked={price === value}
                  onChange={() => setPrice(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <p className="filter-note">
            <strong>A store in the making.</strong>Every helper here is a
            product concept. Explore the examples; purchasing and live tools
            aren’t available in this preview.
          </p>
        </aside>
        <div>
          <div className="results-toolbar">
            <span role="status">
              {results.length} {results.length === 1 ? "helper" : "helpers"}
              {category
                ? ` for ${categoryFor(category).name.toLowerCase()}`
                : " to make work a little lighter"}
            </span>
            <div>
              <label htmlFor="sort">Sort:</label>
              <select
                aria-label="Sort products"
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="curated">Curated order</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="az">Name: A to Z</option>
              </select>
            </div>
          </div>
          {(query || format !== "all" || price !== "all") && (
            <div className="catalog-query">
              <span>
                {query ? `Results for “${query}”` : "Filters applied"}
              </span>
              <button onClick={clear} aria-label="Clear search and filters">
                <X size={16} />
              </button>
            </div>
          )}
          {results.length ? (
            <>
              <div className="product-grid catalog-grid">
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <p className="end-of-results">
                You’ve seen all {results.length} helpers in this selection.
              </p>
            </>
          ) : (
            <div className="no-results">
              <h2>A little too specific?</h2>
              <p>
                Try a simpler task, like “reply,” “content,” or “invoice.”
                <br />
                Or clear your filters to see more possibilities.
              </p>
              <button className="button button-dark" onClick={clear}>
                Show all helpers
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
