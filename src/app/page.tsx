import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container stack">
      <h1>Recipe Hub</h1>
      <p>Upload screenshots or videos, then review extracted recipes.</p>
      <p className="muted">Old-timey kitchen mode: dusty rose cards on a cream backdrop.</p>

      <div className="actions">
        <Link href="/upload" className="button">
          Upload Media
        </Link>
        <Link href="/recipes/demo/edit" className="button secondary">
          Open Demo Editor
        </Link>
        <Link href="/recipes/cowboy-butter-chicken-shells/card" className="button secondary">
          View Recipe Card
        </Link>
        <Link href="/telemetry" className="button secondary">
          View Telemetry
        </Link>
      </div>

      <section className="card-grid" aria-label="Recipe card previews">
        <article className="recipe-card recipe-card-minimal">
          <h2>Minimal</h2>
          <p>Clean recipe presentation with a classic cookbook feel.</p>
          <Link href="/recipes/cowboy-butter-chicken-shells/card?variant=minimal" className="button secondary">
            Open Minimal Card
          </Link>
        </article>
        <article className="recipe-card recipe-card-cozy">
          <h2>Cozy</h2>
          <p>Warm, old-timey palette for handwritten-family-recipe vibes.</p>
          <Link href="/recipes/cowboy-butter-chicken-shells/card?variant=cozy" className="button secondary">
            Open Cozy Card
          </Link>
        </article>
        <article className="recipe-card recipe-card-pro">
          <h2>Pro</h2>
          <p>Sharper visual contrast while staying in the dusty rose palette.</p>
          <Link href="/recipes/cowboy-butter-chicken-shells/card?variant=pro" className="button secondary">
            Open Pro Card
          </Link>
        </article>
      </section>
    </main>
  );
}
