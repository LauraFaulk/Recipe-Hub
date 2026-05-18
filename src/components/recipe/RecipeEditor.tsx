'use client';

import { useState } from 'react';

interface EditableIngredient {
  id: string;
  name: string;
}

interface EditableStep {
  id: string;
  order: number;
  text: string;
}

interface EditableRecipe {
  id: string;
  title: string;
  ingredients: EditableIngredient[];
  steps: EditableStep[];
  metadata: Record<string, unknown>;
  source: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function RecipeEditor({ recipeId }: { recipeId: string }) {
  const [recipe, setRecipe] = useState<EditableRecipe | null>(null);
  const [status, setStatus] = useState('Idle');

  async function loadRecipe() {
    setStatus('Loading...');
    const response = await fetch(`/api/recipes/${recipeId}`);
    if (!response.ok) {
      setStatus('Recipe not found. Upload and ingest first.');
      return;
    }

    const payload = (await response.json()) as { recipe: EditableRecipe };
    setRecipe(payload.recipe);
    setStatus('Loaded recipe.');
  }

  function updateTitle(title: string) {
    if (!recipe) return;
    setRecipe({ ...recipe, title });
  }

  function updateIngredient(index: number, name: string) {
    if (!recipe) return;
    const ingredients = [...recipe.ingredients];
    ingredients[index] = { ...ingredients[index], name };
    setRecipe({ ...recipe, ingredients });
  }

  function addIngredient() {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { id: `ing_${crypto.randomUUID()}`, name: '' }],
    });
  }

  function updateStep(index: number, text: string) {
    if (!recipe) return;
    const steps = [...recipe.steps];
    steps[index] = { ...steps[index], text };
    setRecipe({ ...recipe, steps });
  }

  function addStep() {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      steps: [
        ...recipe.steps,
        { id: `step_${crypto.randomUUID()}`, order: recipe.steps.length + 1, text: '' },
      ],
    });
  }

  async function saveRecipe() {
    if (!recipe) return;
    setStatus('Saving...');
    const response = await fetch(`/api/recipes/${recipeId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recipe: { ...recipe, updatedAt: new Date().toISOString() } }),
    });

    if (!response.ok) {
      setStatus('Save failed.');
      return;
    }

    const payload = (await response.json()) as { recipe: EditableRecipe };
    setRecipe(payload.recipe);
    setStatus('Saved.');
  }

  return (
    <section className="stack">
      <button className="button" onClick={loadRecipe} type="button">
        Load Recipe
      </button>
      <p>{status}</p>

      {recipe ? (
        <article className="recipe-card">
          <label className="stack">
            <span>Title</span>
            <input value={recipe.title} onChange={(event) => updateTitle(event.target.value)} />
          </label>

          <div className="stack">
            <h2>Ingredients</h2>
            {recipe.ingredients.map((ingredient, index) => (
              <input
                key={ingredient.id}
                value={ingredient.name}
                onChange={(event) => updateIngredient(index, event.target.value)}
                placeholder={`Ingredient ${index + 1}`}
              />
            ))}
            <button type="button" className="button secondary" onClick={addIngredient}>
              Add Ingredient
            </button>
          </div>

          <div className="stack">
            <h2>Steps</h2>
            {recipe.steps.map((step, index) => (
              <textarea
                key={step.id}
                rows={3}
                value={step.text}
                onChange={(event) => updateStep(index, event.target.value)}
                placeholder={`Step ${index + 1}`}
              />
            ))}
            <button type="button" className="button secondary" onClick={addStep}>
              Add Step
            </button>
          </div>

          <button className="button" type="button" onClick={saveRecipe}>
            Save Recipe
          </button>
        </article>
      ) : null}
    </section>
  );
}
