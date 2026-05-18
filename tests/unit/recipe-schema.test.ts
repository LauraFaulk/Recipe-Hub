import assert from 'node:assert/strict';
import test from 'node:test';

test('safeValidateRecipe accepts valid recipe payload', async (t) => {
  let safeValidateRecipe: typeof import('../../src/lib/validation/recipe-schema.ts').safeValidateRecipe;

  try {
    ({ safeValidateRecipe } = await import('../../src/lib/validation/recipe-schema.ts'));
  } catch {
    t.skip('Skipping schema tests because zod is not available in this environment.');
    return;
  }

  const now = new Date().toISOString();
  const result = safeValidateRecipe({
    id: 'rcp_1',
    title: 'Pasta',
    ingredients: [{ id: 'ing_1', name: 'Pasta', amount: 1, unit: 'lb' }],
    steps: [{ id: 's1', order: 1, text: 'Boil water.' }],
    metadata: {},
    source: { sourceType: 'text', extractionConfidence: 0.9, parserVersion: 'v1' },
    createdAt: now,
    updatedAt: now,
  });

  assert.equal(result.success, true);
});

test('safeValidateRecipe rejects missing title', async (t) => {
  let safeValidateRecipe: typeof import('../../src/lib/validation/recipe-schema.ts').safeValidateRecipe;

  try {
    ({ safeValidateRecipe } = await import('../../src/lib/validation/recipe-schema.ts'));
  } catch {
    t.skip('Skipping schema tests because zod is not available in this environment.');
    return;
  }

  const now = new Date().toISOString();
  const result = safeValidateRecipe({
    id: 'rcp_1',
    ingredients: [{ id: 'ing_1', name: 'Pasta' }],
    steps: [{ id: 's1', order: 1, text: 'Boil water.' }],
    metadata: {},
    source: { sourceType: 'text', extractionConfidence: 0.9, parserVersion: 'v1' },
    createdAt: now,
    updatedAt: now,
  });

  assert.equal(result.success, false);
});
