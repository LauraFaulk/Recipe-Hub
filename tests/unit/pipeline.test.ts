import assert from 'node:assert/strict';
import test from 'node:test';

import { runIngestionPipeline } from '../../src/lib/ingest/pipeline';

test('runIngestionPipeline returns validated recipe when parser output is valid', async () => {
  const now = new Date().toISOString();
  const result = await runIngestionPipeline('med_1', {
    extractRawText: async () => 'Mix ingredients and bake',
    parseRecipe: async () => ({
      id: 'rcp_1',
      title: 'Cake',
      ingredients: [{ id: 'ing_1', name: 'Flour' }],
      steps: [{ id: 'step_1', order: 1, text: 'Mix ingredients.' }],
      metadata: {},
      source: { sourceType: 'text', extractionConfidence: 0.8, parserVersion: 'v1' },
      createdAt: now,
      updatedAt: now,
    }),
  });

  assert.equal(result.warnings.length, 0);
  assert.equal(result.recipe.title, 'Cake');
});
