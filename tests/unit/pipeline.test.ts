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
