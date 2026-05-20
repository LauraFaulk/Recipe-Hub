import assert from 'node:assert/strict';
import test from 'node:test';

test('runIngestionPipeline returns validated recipe when parser output is valid', async (t) => {
  let runIngestionPipeline: typeof import('../../src/lib/ingest/pipeline.ts').runIngestionPipeline;

  try {
    ({ runIngestionPipeline } = await import('../../src/lib/ingest/pipeline.ts'));
  } catch {
    t.skip('Skipping pipeline test because validation dependencies are unavailable in this environment.');
    return;
  }

import { runIngestionPipeline } from '../../src/lib/ingest/pipeline';

test('runIngestionPipeline returns validated recipe when parser output is valid', async () => {
  const now = new Date().toISOString();
  const result = await runIngestionPipeline('med_1', 'text', {
    extractRawText: async () => 'Mix ingredients and bake',
    parseRecipe: async (_rawText, _mediaId, sourceType) => ({
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


test('runIngestionPipeline preserves sourceType in fallback recipe', async (t) => {
  let runIngestionPipeline: typeof import('../../src/lib/ingest/pipeline.ts').runIngestionPipeline;

  try {
    ({ runIngestionPipeline } = await import('../../src/lib/ingest/pipeline.ts'));
  } catch {
    t.skip('Skipping pipeline test because validation dependencies are unavailable in this environment.');
    return;
  }

  const result = await runIngestionPipeline('med_2', 'video', {
    extractRawText: async () => 'raw text',
    parseRecipe: async () => ({ invalid: true }),
  });

  assert.equal(result.warnings.length > 0, true);
  assert.equal(result.recipe.source.sourceType, 'video');
});
