import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Plus } from "lucide-react";
import { products, categoryFor } from "@/lib/catalog";
import {
  ProductArt,
  ProductShelf,
  SectionHeading,
} from "@/components/storefront";
import ProductDemo from "@/components/product-demo";
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = products.find((p) => p.slug === slug);
  return { title: p?.name || "Product not found", description: p?.promise };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const category = categoryFor(product.category);
  const isReply = slug === "customer-reply-studio";
  const faqs = [
    [
      "Can I buy or use this product now?",
      "This is a design preview. The product, price, and examples are illustrative. Purchasing, downloads, and live AI generation are not available.",
    ],
    [
      "Do I need technical experience?",
      "The proposed experience is guided and designed for a small-business owner. You would provide your business context, follow the prompts, and review the output. No code is required by this concept.",
    ],
    [
      "Will it work without my input?",
      `You would need to provide ${product.input.toLowerCase()}. The helper would use this information to prepare a starting point for your review; it would not make decisions or take actions on your behalf.`,
    ],
    [
      "What happens to my business information?",
      "This preview does not collect or submit business information. Product-specific data handling, permissions, and retention terms must be finalized and disclosed before any live service is offered.",
    ],
    [
      "What would happen after purchase?",
      "The proposed path is a product access page, a short setup guide, and a first-use walkthrough. The actual delivery format and support terms will be confirmed before this product is available.",
    ],
  ];
  return (
    <div className="page-width product-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/store">Shop</Link>
        <span>/</span>
        <Link href={`/categories/${category.id}`}>{category.name}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <section className="product-hero">
        <ProductArt product={product} large />
        <div className="product-summary">
          <p className="eyebrow">
            {category.name.toUpperCase()} / {product.id}
          </p>
          <h1>{product.name}</h1>
          <p className="product-promise">{product.promise}</p>
          <p className="product-intro">
            {isReply
              ? "Turn a customer’s message into a clear, considerate reply. Add a little context, choose your tone, and make the draft your own before you send it."
              : `A focused digital helper for ${product.name.toLowerCase()}. Bring your business context, follow a clear starting point, and shape the result to fit your needs.`}
          </p>
          <div className="product-price">
            <strong>${product.price}</strong>
            <span>Illustrative one-time price</span>
          </div>
          <Link className="button button-dark" href="#demo">
            Explore the example
            <ArrowRight size={18} />
          </Link>
          <p className="preview-disclosure">
            Product concept · This is a visual preview, not a live product.
            <br />
            Purchasing and installation are not available.
          </p>
          <div className="product-requirements-short">
            <span>
              <Check size={13} /> No coding in the proposed workflow
            </span>
            <span>
              <Check size={13} /> Reviewable output
            </span>
          </div>
        </div>
      </section>
      <nav className="product-subnav" aria-label="On this page">
        <div>
          <a href="#overview">Overview</a>
          <a href="#included">What’s included</a>
          <a href="#demo">See it in action</a>
          <a href="#setup">Getting started</a>
          <a href="#questions">Questions</a>
        </div>
        <span>DESIGNED TO MAKE WORK FEEL LIGHTER</span>
      </nav>
      <section className="product-section" id="overview">
        <SectionHeading
          eyebrow="A LITTLE HELP WITH A FAMILIAR JOB"
          title={
            isReply
              ? "More care. Less second-guessing."
              : "A clearer way to get started."
          }
        />
        <div className="benefit-grid">
          {(isReply
            ? [
                [
                  "Start with something useful",
                  "Turn a customer inquiry into a considered first draft. Spend your attention on the details that need a personal touch.",
                ],
                [
                  "Sound like your business",
                  "Choose a warm, concise, or formal starting point. Add your own voice and the facts that make the reply yours.",
                ],
                [
                  "Keep the final say",
                  "Review, edit, and send the reply yourself. Nothing is sent automatically, and every response stays in your hands.",
                ],
              ]
            : [
                [
                  "Bring your context",
                  `Start with ${product.input.toLowerCase()}. The quality of the information you provide shapes the usefulness of the result.`,
                ],
                [
                  "Find a clear starting point",
                  `Use the ${product.name.toLowerCase()} example and guided structure to organize your next piece of work.`,
                ],
                [
                  "Make it your own",
                  "Review every detail, adjust for your business, and decide when the result is ready to use.",
                ],
              ]
          ).map(([title, text], i) => (
            <div key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="product-section split-section" id="included">
        <div>
          <p className="eyebrow">THE DETAILS, UP FRONT</p>
          <h2>
            Know exactly
            <br />
            what you’re getting.
          </h2>
          <p>
            The proposed product includes a focused set of useful materials. No
            vague promises. A clear starting point, ready to make your own.
          </p>
        </div>
        <ul className="deliverables">
          {product.deliverables.map((d) => (
            <li key={d}>
              <Check size={17} />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="product-section" id="demo">
        <SectionHeading
          eyebrow="FROM INPUT TO SOMETHING USEFUL"
          title={
            isReply
              ? "Same message. Your kind of reply."
              : "Here’s what that could look like."
          }
          description={
            isReply
              ? "Choose a tone to explore three prewritten examples."
              : "An illustrative output showing the proposed structure and presentation."
          }
        />
        {isReply ? (
          <ProductDemo />
        ) : (
          <div className="generic-demo">
            <div>
              <p className="eyebrow">YOU BRING THE CONTEXT</p>
              <h3>{product.input}.</h3>
              <p>
                The helper provides a starting point. You check the details,
                edit the output, and decide how to use it.
              </p>
            </div>
            <ProductArt product={product} large />
          </div>
        )}
      </section>
      <section className="product-section split-section">
        <div>
          <p className="eyebrow">FIND YOUR FIT</p>
          <h2>
            Made for the person
            <br />
            wearing many hats.
          </h2>
          <p>
            {isReply
              ? "For owners, small teams, and anyone who handles customer conversations alongside everything else. Especially useful when you know what to say, but need help finding the words."
              : `For small-business owners and teams who want a more structured approach to ${product.name.toLowerCase()} without starting from a blank page.`}
          </p>
        </div>
        <div className="fit-note">
          <h3>A helper, with clear boundaries.</h3>
          <p>
            {isReply
              ? "It drafts replies. It does not connect to your inbox, send messages, invent your policies, or promise refunds on your behalf."
              : "It provides an editable starting point. It does not verify your business facts, make commitments, or take actions in other systems."}
          </p>
          <p>
            Check names, numbers, policies, and sensitive details before using
            any output. Money-related helpers organize information; they do not
            provide accounting or financial advice.
          </p>
        </div>
      </section>
      <section className="product-section" id="setup">
        <SectionHeading
          eyebrow="THE PROPOSED GETTING-STARTED PATH"
          title="From “that looks useful” to using it."
          description="A preview of how setup would work once the product is available."
        />
        <div className="setup-steps">
          {[
            [
              "Open your helper",
              "Access your product and its quick-start guide. Check what you need before getting started.",
            ],
            [
              "Add your business context",
              product.input +
                ". Use the example to see how much detail to include.",
            ],
            [
              "Review your first result",
              "Check the output, make it your own, and save the version that works for you.",
            ],
          ].map(([title, text], i) => (
            <div className="setup-step" key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="requirements-box">
          <h3>Before you begin</h3>
          <p>
            {product.requirement} The final delivery method, account
            requirements, setup time, and any third-party costs are not yet
            determined. This preview does not install software or generate live
            results.
          </p>
        </div>
      </section>
      <section className="product-section split-section" id="questions">
        <div>
          <p className="eyebrow">A LITTLE REASSURANCE</p>
          <h2>
            Good questions.
            <br />
            Clear answers.
          </h2>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={17} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="product-end">
        <div>
          <h2>{product.promise}</h2>
          <p>
            {product.name} · ${product.price} illustrative one-time price
          </p>
        </div>
        <div>
          <button className="button" disabled>
            Purchasing unavailable in preview
          </button>
          <small>A product concept. No payment will be taken.</small>
        </div>
      </section>
      <section className="section">
        <SectionHeading
          eyebrow="A LITTLE MORE POSSIBILITY"
          title="Good company for your new helper."
          href={`/categories/${category.id}`}
          link={`Explore ${category.name.toLowerCase()}`}
        />
        <ProductShelf
          products={products
            .filter(
              (p) => p.category === product.category && p.id !== product.id,
            )
            .slice(0, 3)}
        />
      </section>
    </div>
  );
}
