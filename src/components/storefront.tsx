import Link from "next/link";
import MobileNav from "./mobile-nav";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  MessagesSquare,
  PenLine,
  TrendingUp,
  Layers3,
  Wallet,
  Users,
  Plus,
  Check,
  CornerDownRight,
} from "lucide-react";
import {
  categoryFor,
  type Product,
  type ArtKind,
} from "@/lib/catalog";

const icons = {
  messages: MessagesSquare,
  pen: PenLine,
  growth: TrendingUp,
  layers: Layers3,
  wallet: Wallet,
  people: Users,
};
export function CategoryIcon({
  icon,
  size = 25,
}: {
  icon: string;
  size?: number;
}) {
  const Icon = icons[icon as keyof typeof icons] || Layers3;
  return <Icon size={size} strokeWidth={1.4} />;
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Simple Digital Help home">
      <span className="brand-mark">
        <span />
        <span />
        <span />
      </span>
      <span>
        simple digital help<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
export function Header() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/#sales-growth">Sales</Link>
            <Link href="/#marketing-content">Marketing &amp; Content</Link>
          </nav>
          <MobileNav />
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Brand />
          <p>Small helpers. Big possibilities.</p>
        </div>
        <div className="footer-links" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <span>EXPLORE</span>
            <Link href="/#sales-growth">Sales &amp; Growth</Link>
            <Link href="/#marketing-content">Marketing &amp; Content</Link>
            <Link href="/legal">Legal</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Simple Digital Help. Operated by
          Experimental LLC.
        </span>
      </div>
    </footer>
  );
}
export function SearchForm({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action="/store"
      className={`search-form ${compact ? "compact" : ""}`}
      role="search"
    >
      <Search size={21} strokeWidth={1.5} />
      <input
        name="q"
        aria-label="Search for help with a business task"
        placeholder="What would you like a little help with?"
      />
      <button aria-label="Search products" type="submit">
        <ArrowRight size={20} />
      </button>
    </form>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  link = "Explore all products",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {link}
          <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}

export function ProductArt({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  const kind: ArtKind = product.kind;
  return (
    <div
      className={`product-art tone-${product.tone} art-${kind} ${large ? "art-large" : ""}`}
      aria-label={`Illustrative ${product.name} output`}
      role="img"
    >
      <div className="art-grid" />
      <div className="art-sheet" aria-hidden="true">
        <div className="sheet-heading">
          <span className="tiny-logo">
            s<span>d</span>h.
          </span>
          <span>
            {kind === "message"
              ? "YOUR REPLY, CONSIDERED"
              : product.name.toUpperCase()}
          </span>
          <span className="sheet-menu">···</span>
        </div>
        {kind === "message" ? (
          <>
            <div className="message-meta">
              <span className="avatar">A</span>
              <div>
                <strong>Alex Morgan</strong>
                <span>A new customer conversation</span>
              </div>
            </div>
            <div className="incoming-note">
              Hi! I’d love to know a little more.
              <br />
              Could you help me with the next steps?
            </div>
            <div className="reply-note">
              <span className="output-kicker">{product.outputLabel}</span>
              {product.outputLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="sheet-bottom">
              <span>
                <span className="small-dot" /> Ready for your review
              </span>
              <CornerDownRight size={15} />
            </div>
          </>
        ) : kind === "calendar" ? (
          <>
            <span className="output-kicker">A LITTLE ROOM TO PLAN</span>
            <h3>{product.outputTitle}</h3>
            <div className="calendar-days">
              {["MON", "TUE", "WED", "THU", "FRI"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i}>
                  <small>{i + 1}</small>
                  {[1, 4, 7, 10].includes(i) && (
                    <span>{product.outputLines[[1, 4, 7, 10].indexOf(i)]}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="sheet-bottom">
              <span>Thoughtfully planned. Yours to edit.</span>
              <Plus size={14} />
            </div>
          </>
        ) : kind === "report" ? (
          <>
            <span className="output-kicker">THE DETAILS, SIMPLIFIED</span>
            <h3>{product.outputTitle}</h3>
            <div className="report-bars">
              {[38, 65, 46, 80, 58, 94, 69].map((height, i) => (
                <span key={i} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="report-list">
              {product.outputLines.map((line, i) => (
                <div key={line}>
                  <span>{line}</span>
                  <span>0{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="sheet-bottom">
              <span>Illustrative report</span>
              <ArrowUpRight size={15} />
            </div>
          </>
        ) : kind === "people" ? (
          <>
            <div className="people-initials">
              <span>A</span>
              <span>J</span>
              <span>M</span>
            </div>
            <span className="output-kicker">LET’S MAKE A GOOD START</span>
            <h3>{product.outputTitle}</h3>
            <div className="checklist-lines">
              {product.outputLines.map((line, i) => (
                <div key={line}>
                  <span className="line-number">0{i + 1}</span>
                  <span>{line}</span>
                  <ArrowRight size={13} />
                </div>
              ))}
            </div>
            <div className="sheet-bottom">
              <span>A guide made for your team</span>
              <Plus size={14} />
            </div>
          </>
        ) : (
          <>
            <span className="output-kicker">
              {kind === "document"
                ? "THE BEGINNING OF SOMETHING GOOD"
                : "A LITTLE CLARITY GOES A LONG WAY"}
            </span>
            <h3>{product.outputTitle}</h3>
            <div
              className={`checklist-lines ${kind === "checklist" ? "with-checks" : ""}`}
            >
              {product.outputLines.map((line, i) => (
                <div key={line}>
                  {kind === "checklist" ? (
                    <span className="check-square">
                      {i === 0 && <Check size={12} />}
                    </span>
                  ) : (
                    <span className="line-number">0{i + 1}</span>
                  )}
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="document-rule" />
            <div className="sheet-bottom">
              <span>
                {kind === "document"
                  ? "A first draft. Ready to make your own."
                  : "Small steps. A clearer day."}
              </span>
              <ArrowUpRight size={14} />
            </div>
          </>
        )}
      </div>
      {large && (
        <div className="art-caption">
          <span className="small-dot" /> A little help, beautifully put to work.
        </div>
      )}
    </div>
  );
}
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link className="product-card" href={`/products/${product.slug}`}>
      <ProductArt product={product} />
      <div className="card-meta">
        <span>{categoryFor(product.category).name}</span>
        <ArrowUpRight size={17} />
      </div>
      <h3>{product.name}</h3>
      <p>{product.promise}</p>
      <div className="card-price">
        ${product.price}
        <span>Illustrative price · one-time</span>
      </div>
    </Link>
  );
}
export function ProductShelf({ products }: { products: Product[] }) {
  return (
    <div className="product-grid shelf">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
