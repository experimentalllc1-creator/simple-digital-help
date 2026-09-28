import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { categories, collections, products } from "@/lib/catalog";
import {
  CategoryIcon,
  ProductArt,
  ProductShelf,
  SearchForm,
  SectionHeading,
} from "@/components/storefront";
export default function Home() {
  return (
    <>
      <section className="hero page-width">
        <div className="hero-copy">
          <p className="eyebrow">SMALL HELPERS. BIG POSSIBILITIES.</p>
          <h1>
            Your business.
            <br />A little <span>lighter.</span>
          </h1>
          <p className="hero-description">
            Thoughtfully made digital helpers for the work that fills your day.
            Find a little help. Make room for what’s next.
          </p>
          <Link href="/store" className="button button-dark">
            Find your next helping hand
            <ArrowRight size={18} />
          </Link>
          <span className="hero-footnote">
            Practical tools. Clear purpose. Made for small business.
          </span>
        </div>
        <Link href="/products/customer-reply-studio" className="hero-feature">
          <div className="hero-feature-top">
            <span>MEET YOUR NEXT HELPING HAND</span>
            <ArrowUpRight size={21} />
          </div>
          <ProductArt product={products[0]} large />
          <div className="hero-feature-bottom">
            <div>
              <span>CUSTOMER CARE, CONSIDERED.</span>
              <h2>
                Good replies.
                <br />
                Great first impressions.
              </h2>
            </div>
            <span className="round-link">
              <ArrowUpRight size={23} />
            </span>
          </div>
        </Link>
      </section>
      <section className="discovery page-width">
        <div>
          <span className="eyebrow">THERE’S HELP FOR THAT.</span>
          <h2>What’s on your list?</h2>
        </div>
        <div className="discovery-search">
          <SearchForm />
          <div className="search-suggestions">
            <span>Try:</span>
            <Link href="/store?q=customer">customer replies</Link>
            <Link href="/store?q=content">content planning</Link>
            <Link href="/store?q=invoice">invoice follow-ups</Link>
          </div>
        </div>
      </section>
      <section
        className="section page-width categories-section"
        id="categories"
      >
        <SectionHeading
          eyebrow="A PLACE FOR EVERY KIND OF WORK"
          title="Find help where you need it."
          href="/store"
          link="Shop all categories"
        />
        <div className="category-grid category-grid--featured">
          <Link className="category-feature" href="/categories/sales">
            <Image
              className="category-feature-image"
              src="/images/categories/sales-growth-iceberg.webp"
              width={800}
              height={800}
              loading="eager"
              unoptimized
              alt="An iceberg showing three market layers: A at the tip, B above the waterline, and a much larger C beneath the surface."
            />
            <div className="category-feature-copy">
              <div className="category-feature-heading">
                <h3>Sales &amp; Growth</h3>
                <ArrowUpRight size={22} aria-hidden="true" />
              </div>
              <p className="category-feature-promise">
                Go beyond the market you already reach.
              </p>
              <div className="category-feature-legend">
                <p>
                  <strong>A — The market you already serve</strong>
                  <span>Customers, relationships, referrals, and opportunities already within reach.</span>
                </p>
                <p>
                  <strong>B — The market you actively pursue</strong>
                  <span>Companies you find through prospecting, networking, events, lists, and manual research.</span>
                </p>
                <p>
                  <strong>C — The market you rarely reach</strong>
                  <span>The much larger pool that requires consistent, ongoing discovery, week after week.</span>
                </p>
              </div>
              <p className="category-feature-summary">
                A is already within reach. Good sales teams work hard to pursue B. Milo opens the door to C.
              </p>
            </div>
          </Link>
          {categories
            .filter((c) => c.id !== "customer-care" && c.id !== "sales")
            .map((c) => (
              <Link
                className="category-tile"
                key={c.id}
                href={`/categories/${c.id}`}
              >
                <CategoryIcon icon={c.icon} />
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.short}</p>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            ))}
        </div>
      </section>
      <section className="section page-width">
        <SectionHeading
          eyebrow="THE EVERYDAY EDIT"
          title="Small things. Off your plate."
          description="A few thoughtful places to start."
          href="/collections/a-lighter-workday"
          link="Explore the edit"
        />
        <ProductShelf
          products={[products[0], products[1], products[2], products[3]]}
        />
      </section>
      <section className="editorial-feature page-width">
        <div className="editorial-copy">
          <p className="eyebrow">LESS STARING AT A BLANK PAGE.</p>
          <h2>
            A good idea.
            <br />A great place
            <br />
            to start.
          </h2>
          <p>
            Your next newsletter, proposal, or month of content. Give your ideas
            a little structure and let your business sound like you.
          </p>
          <Link
            href="/collections/find-your-voice"
            className="button button-light"
          >
            Explore the writing collection
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="editorial-art">
          <div className="editorial-art-first">
            <ProductArt product={products[9]} />
          </div>
          <div className="editorial-art-second">
            <ProductArt product={products[1]} />
          </div>
          <span className="editorial-caption">
            YOUR IDEAS. A LITTLE MORE POLISHED.
          </span>
        </div>
      </section>
      <section className="section page-width" id="collections">
        <SectionHeading
          eyebrow="GOOD THINGS, BROUGHT TOGETHER"
          title="Consider it curated."
          description="Useful combinations for wherever your business is headed."
        />
        <div className="collection-grid">
          {collections.map((c, i) => (
            <Link
              href={`/collections/${c.slug}`}
              className={`collection-card tone-${c.tone}`}
              key={c.slug}
            >
              <div className="collection-card-top">
                <span>COLLECTION 0{i + 1}</span>
                <ArrowUpRight size={23} />
              </div>
              <div className="collection-visual">
                <ProductArt
                  product={products.find((p) => p.slug === c.ids[i])!}
                />
              </div>
              <div className="collection-card-bottom">
                <h3>{c.name}</h3>
                <p>{c.description}</p>
                <span>
                  Explore the collection <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="section page-width">
        <SectionHeading
          eyebrow="MORE POSSIBILITIES"
          title="Make room for what’s next."
          description="From welcoming new people to keeping the details in order."
          href="/store"
          link="Browse all 24 helpers"
        />
        <ProductShelf
          products={[products[5], products[4], products[15], products[18]]}
        />
      </section>
      <section className="how-section page-width" id="how-it-works">
        <div>
          <p className="eyebrow">SIMPLE FROM THE START</p>
          <h2>
            A little help.
            <br />
            Without the homework.
          </h2>
          <p>
            Practical by design. Clear about what you get.
            <br />
            And a path to getting started.
          </p>
        </div>
        <div className="how-steps">
          {[
            [
              "Find your fit",
              "Start with a job you want off your list. See exactly what each helper is designed to do.",
            ],
            [
              "Know what you’re getting",
              "Explore example outputs, what’s included, and what you’ll need before you choose.",
            ],
            [
              "Make it your own",
              "Follow a clear setup guide, add your business details, and review your first result.",
            ],
          ].map(([title, copy], i) => (
            <div key={title}>
              <span className="step-number">0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="closing-line page-width">
        <Check size={19} strokeWidth={1.5} />
        <p>
          One useful thing can make a difference.{" "}
          <Link href="/store">
            Find yours.
            <ArrowRight size={17} />
          </Link>
        </p>
      </section>
    </>
  );
}
