import Link from 'next/link';

import { RecipeCardView } from '../../../../components/cards/RecipeCardView';
import { getRecipe } from '../../../../lib/storage/recipe-store';

const ALLOWED_VARIANTS = new Set(['minimal', 'cozy', 'pro'] as const);

export default async function RecipeCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { id } = await params;
  const { variant } = await searchParams;
  const selectedVariant = variant && ALLOWED_VARIANTS.has(variant as 'minimal' | 'cozy' | 'pro') ? variant : 'minimal';

  const recipe = getRecipe(id);

  if (!recipe) {
    return (
      <main className="container">
        <h1>Recipe not found</h1>
        <p>Try uploading media first, or open the seeded recipe from home.</p>
      </main>
    );
  }

  return (
    <main className="container stack">
      <div className="actions">
        <Link href={`/recipes/${id}/edit`} className="button secondary">
          Back to Editor
        </Link>
        <span className="button" role="note">Use browser print for hard copy</span>
      </div>
      <RecipeCardView recipe={recipe} />
    </main>
  );
}
