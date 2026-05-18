'use client';

import { useMemo, useState } from 'react';

interface EditableIngredient {
  id: string;
  name: string;
}

interface EditableStep {
  id: string;
  order: number;
  text: string;
}

interface RecipeSource {
  extractionConfidence?: number;
}

interface EditableRecipe {
  id: string;
  title: string;
  ingredients: EditableIngredient[];
  steps: EditableStep[];
  metadata: Record<string, unknown>;
  source: RecipeSource & Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function RecipeEditor({ recipeId }: { recipeId: string }) {
  const [recipe, setRecipe] = useState<EditableRecipe | null>(null);
  const [status, setStatus] = useState('Idle');

  const warnings = useMemo(() => {
    if (!recipe) return [] as string[];

    const items: string[] = [];
    const confidence = recipe.source.extractionConfidence;
    if (typeof confidence === 'number' && confidence < 0.7) {
      items.push('Low extraction confidence detected. Double-check ingredients and steps.');
    }
    if (!recipe.title.trim()) {
      items.push('Recipe title is empty. Add a clear title before saving.');
    }
    if (recipe.ingredients.some((ingredient) => !ingredient.name.trim())) {
      items.push('One or more ingredients are empty. Fill in ingredient names.');
    }
    if (recipe.steps.some((step) => !step.text.trim())) {
      items.push('One or more steps are empty. Add instruction text for each step.');
    }

    return items;
  }, [recipe]);

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

  function deleteIngredient(index: number) {
    if (!recipe) return;
    const ingredients = recipe.ingredients.filter((_, currentIndex) => currentIndex !== index);
    setRecipe({ ...recipe, ingredients });
  }

  function normalizeStepOrder(steps: EditableStep[]): EditableStep[] {
    return steps.map((step, index) => ({ ...step, order: index + 1 }));
  }

  function updateStep(index: number, text: string) {
    if (!recipe) return;
    const steps = [...recipe.steps];
    steps[index] = { ...steps[index], text };
    setRecipe({ ...recipe, steps: normalizeStepOrder(steps) });
  }

  function addStep() {
    if (!recipe) return;
    const updatedSteps = [
      ...recipe.steps,
      { id: `step_${crypto.randomUUID()}`, order: recipe.steps.length + 1, text: '' },
    ];

    setRecipe({
      ...recipe,
      steps: normalizeStepOrder(updatedSteps),
    });
  }

  function deleteStep(index: number) {
    if (!recipe) return;
    const steps = recipe.steps.filter((_, currentIndex) => currentIndex !== index);
    setRecipe({ ...recipe, steps: normalizeStepOrder(steps) });
  }

  function moveStep(index: number, direction: 'up' | 'down') {
    if (!recipe) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= recipe.steps.length) {
      return;
    }

    const steps = [...recipe.steps];
    const [moved] = steps.splice(index, 1);
    steps.splice(targetIndex, 0, moved);
    setRecipe({ ...recipe, steps: normalizeStepOrder(steps) });
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
          {warnings.length > 0 ? (
            <aside className="warning-box" role="alert">
              <strong>Review Warnings</strong>
              <ul>
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </aside>
          ) : null}

          <label className="stack">
            <span>Title</span>
            <input value={recipe.title} onChange={(event) => updateTitle(event.target.value)} />
          </label>

          <div className="stack">
            <h2>Ingredients</h2>
            {recipe.ingredients.map((ingredient, index) => (
              <div key={ingredient.id} className="row">
                <input
                  value={ingredient.name}
                  onChange={(event) => updateIngredient(index, event.target.value)}
                  placeholder={`Ingredient ${index + 1}`}
                />
                <button type="button" className="button danger" onClick={() => deleteIngredient(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="button secondary" onClick={addIngredient}>
              Add Ingredient
            </button>
          </div>

          <div className="stack">
            <h2>Steps</h2>
            {recipe.steps.map((step, index) => (
              <div key={step.id} className="stack step-block">
                <div className="row">
                  <strong>Step {index + 1}</strong>
                  <div className="actions compact">
                    <button type="button" className="button secondary" onClick={() => moveStep(index, 'up')}>
                      Up
                    </button>
                    <button type="button" className="button secondary" onClick={() => moveStep(index, 'down')}>
                      Down
                    </button>
                    <button type="button" className="button danger" onClick={() => deleteStep(index)}>
                      Remove
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={step.text}
                  onChange={(event) => updateStep(index, event.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
              </div>
            ))}
            <button type="button" className="button secondary" onClick={addStep}>
              Add Step
            </button>
          </div>

          <div className="actions">
            <button className="button" type="button" onClick={saveRecipe}>
              Save Recipe
            </button>
            <a className="button secondary" href={`/recipes/${recipeId}/card`}>
              View Recipe Card
            </a>
          </div>
        </article>
      ) : null}
    </section>
  );
}
