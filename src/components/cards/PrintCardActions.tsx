'use client';

import Link from 'next/link';

export function PrintCardActions({ recipeId }: { recipeId: string }) {
  return (
    <div className="actions">
      <Link href={`/recipes/${recipeId}/edit`} className="button secondary">
        Back to Editor
      </Link>
      <button type="button" className="button" onClick={() => window.print()}>
        Print Card
      </button>
    </div>
  );
}
