'use client';

import { useState } from 'react';

export function RecipeEditor({ recipeId }: { recipeId: string }) {
  const [recipeJson, setRecipeJson] = useState('');
  const [status, setStatus] = useState('Idle');

  async function loadRecipe() {
    setStatus('Loading...');
    const response = await fetch(`/api/recipes/${recipeId}`);
    if (!response.ok) {
      setStatus('Recipe not found. Upload and ingest first.');
      return;
    }

    const payload = await response.json();
    setRecipeJson(JSON.stringify(payload.recipe, null, 2));
    setStatus('Loaded recipe JSON.');
  }

  return (
    <section className="stack">
      <button className="button" onClick={loadRecipe} type="button">
        Load Recipe
      </button>
      <p>{status}</p>
      <textarea value={recipeJson} readOnly rows={20} className="codebox" />
    </section>
  );
}
