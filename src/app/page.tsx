import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <h1>Recipe Hub</h1>
      <p>Upload screenshots or videos, then review extracted recipes.</p>

      <div className="actions">
        <Link href="/upload" className="button">
          Upload Media
        </Link>
        <Link href="/recipes/cowboy-butter-chicken-shells/edit" className="button secondary">
          Open Seed Recipe
        </Link>
        <Link href="/recipes/cowboy-butter-chicken-shells/card" className="button secondary">
          View Recipe Card
        </Link>
        <Link href="/telemetry" className="button secondary">
          View Telemetry
        </Link>
      </div>
    </main>
  );
}
