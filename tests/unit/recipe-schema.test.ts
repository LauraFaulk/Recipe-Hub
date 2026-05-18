import assert from 'node:assert/strict';
import test from 'node:test';

import { safeValidateRecipe } from '../../src/lib/validation/recipe-schema';
import { IngestRequestSchema } from '../../src/lib/validation/api-schemas';

test('safeValidateRecipe accepts valid recipe payload', () => {
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

test('safeValidateRecipe rejects missing title', () => {
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

test('IngestRequestSchema requires mediaId', () => {
  assert.equal(IngestRequestSchema.safeParse({ mediaId: 'med_1' }).success, true);
  assert.equal(IngestRequestSchema.safeParse({}).success, false);
});
