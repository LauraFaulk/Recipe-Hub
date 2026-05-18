import Link from 'next/link';

import { RecipeCardView } from '../../../../components/cards/RecipeCardView';
import { getRecipe } from '../../../../lib/storage/recipe-store';

export default async function RecipeCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
