import assert from 'node:assert/strict';
import test from 'node:test';

import { getRecipe, putRecipe, updateRecipe } from '../../src/lib/storage/recipe-store.ts';
import type { Recipe } from '../../src/types/recipe.ts';

function makeRecipe(id: string): Recipe {
  const now = new Date().toISOString();
  return {
    id,
    title: 'Recipe',
    ingredients: [{ id: 'ing_1', name: 'Salt' }],
    steps: [{ id: 'step_1', order: 1, text: 'Cook.' }],
    metadata: {},
    source: { sourceType: 'text', extractionConfidence: 1, parserVersion: 'test' },
    createdAt: now,
    updatedAt: now,
  };
}

test('putRecipe/getRecipe stores and retrieves recipe', () => {
  const recipe = makeRecipe('rcp_store_1');
  putRecipe(recipe);
  const found = getRecipe(recipe.id);
  assert.equal(found?.id, recipe.id);
});

test('updateRecipe returns undefined when recipe does not exist', () => {
  const recipe = makeRecipe('rcp_missing');
  const result = updateRecipe('does_not_exist', recipe);
  assert.equal(result, undefined);
});
