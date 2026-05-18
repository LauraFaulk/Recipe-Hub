import { RecipeEditor } from '../../../../components/recipe/RecipeEditor';

export default async function RecipeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="container">
      <h1>Edit Recipe</h1>
      <p>Recipe ID: {id}</p>
      <RecipeEditor recipeId={id} />
    </main>
  );
}
