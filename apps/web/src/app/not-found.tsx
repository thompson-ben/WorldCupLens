import Link from "next/link";

export default function NotFound() {
  return (
    <section style={{ marginTop: "2rem" }}>
      <p className="eyebrow">404</p>
      <h1 className="page-title">We couldn&apos;t find that page</h1>
      <p className="muted">The tournament or page you&apos;re after doesn&apos;t exist.</p>
      <div className="actions">
        <Link className="btn" href="/tournaments">
          Browse tournaments
        </Link>
      </div>
    </section>
  );
}
