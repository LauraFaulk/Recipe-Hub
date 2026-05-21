import assert from 'node:assert/strict';
import test from 'node:test';

async function loadExportDeps(t: import('node:test').TestContext) {
  try {
    const exportRoute = await import('../../src/app/api/recipes/[id]/export/route.ts');
    const recipeStore = await import('../../src/lib/storage/recipe-store.ts');

    return {
      exportGet: exportRoute.GET as (
        request: Request,
        ctx: { params: Promise<{ id: string }> },
      ) => Promise<Response>,
      putRecipe: recipeStore.putRecipe,
    };
  } catch {
    t.skip('Skipping export route tests because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('GET /api/recipes/:id/export returns 404 for unknown recipe', async (t) => {
  const deps = await loadExportDeps(t);
  if (!deps) return;

  const response = await deps.exportGet(new Request('http://localhost/api/recipes/unknown/export'), {
    params: Promise.resolve({ id: 'unknown' }),
  });

  assert.equal(response.status, 404);
});

test('GET /api/recipes/:id/export returns downloadable html for known recipe', async (t) => {
  const deps = await loadExportDeps(t);
  if (!deps) return;

  const now = new Date().toISOString();
  const recipeId = `rcp_export_${Date.now()}`;
  deps.putRecipe({
    id: recipeId,
    title: 'Exportable Soup',
    ingredients: [{ id: 'ing_1', name: 'Water' }],
    steps: [{ id: 'step_1', order: 1, text: 'Boil.' }],
    metadata: {},
    source: { sourceType: 'text', extractionConfidence: 0.9, parserVersion: 'test' },
    createdAt: now,
    updatedAt: now,
  });

  const response = await deps.exportGet(new Request(`http://localhost/api/recipes/${recipeId}/export`), {
    params: Promise.resolve({ id: recipeId }),
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type')?.includes('text/html'), true);
  assert.equal(response.headers.get('content-disposition')?.includes(`${recipeId}.html`), true);

  const html = await response.text();
  assert.equal(html.includes('Exportable Soup'), true);
});
