import Link from "next/link";
export default function NotFound() {
  return (
    <section className="page-width not-found">
      <p className="eyebrow">LET’S FIND YOUR WAY</p>
      <h1>This helper isn’t on the shelf.</h1>
      <p>Explore the store to find something useful for your business.</p>
      <Link className="button button-dark" href="/store">
        Back to the store →
      </Link>
    </section>
  );
}
