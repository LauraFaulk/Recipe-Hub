import { RecipeCardView } from '../../../../components/cards/RecipeCardView';
import { PrintCardActions } from '../../../../components/cards/PrintCardActions';
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
      <PrintCardActions recipeId={id} />
      <div className="actions">
        <a className={`button ${selectedVariant === 'minimal' ? '' : 'secondary'}`} href={`/recipes/${id}/card?variant=minimal`}>
          Minimal
        </a>
        <a className={`button ${selectedVariant === 'cozy' ? '' : 'secondary'}`} href={`/recipes/${id}/card?variant=cozy`}>
          Cozy
        </a>
        <a className={`button ${selectedVariant === 'pro' ? '' : 'secondary'}`} href={`/recipes/${id}/card?variant=pro`}>
          Pro
        </a>
      </div>
      <RecipeCardView recipe={recipe} variant={selectedVariant as 'minimal' | 'cozy' | 'pro'} />
    </main>
  );
}
