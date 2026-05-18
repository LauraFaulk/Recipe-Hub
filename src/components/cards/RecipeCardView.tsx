import type { Recipe } from '../../types/recipe';

export function RecipeCardView({ recipe }: { recipe: Recipe }) {
  return (
    <article className="recipe-card printable-card">
      <header>
        <h1>{recipe.title}</h1>
        <p>
          Servings: {recipe.metadata.servings ?? '-'} • Prep: {recipe.metadata.prepTimeMinutes ?? '-'} min • Cook:{' '}
          {recipe.metadata.cookTimeMinutes ?? '-'} min • Total: {recipe.metadata.totalTimeMinutes ?? '-'} min
        </p>
      </header>

      <section>
        <h2>Ingredients</h2>
        <ul>
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              {ingredient.amount ?? ''} {ingredient.unit ?? ''} {ingredient.name}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Directions</h2>
        <ol>
          {recipe.steps
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <li key={step.id}>{step.text}</li>
            ))}
        </ol>
      </section>
    </article>
  );
}
