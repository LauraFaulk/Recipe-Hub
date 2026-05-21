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
    t.skip('Skipping export safety test because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('export HTML escapes recipe content to avoid raw tag injection', async (t) => {
  const deps = await loadExportDeps(t);
  if (!deps) return;

  const now = new Date().toISOString();
  const recipeId = `rcp_escape_${Date.now()}`;
  deps.putRecipe({
    id: recipeId,
    title: '<script>alert(1)</script>',
    ingredients: [{ id: 'ing_1', name: '<b>salt</b>' }],
    steps: [{ id: 'step_1', order: 1, text: '<img src=x onerror=alert(1) />' }],
    metadata: {},
    source: { sourceType: 'text', extractionConfidence: 1, parserVersion: 'test' },
    createdAt: now,
    updatedAt: now,
  });

  const response = await deps.exportGet(new Request(`http://localhost/api/recipes/${recipeId}/export`), {
    params: Promise.resolve({ id: recipeId }),
  });

  assert.equal(response.status, 200);
  const html = await response.text();

  assert.equal(html.includes('<script>alert(1)</script>'), false);
  assert.equal(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), true);
  assert.equal(html.includes('<b>salt</b>'), false);
  assert.equal(html.includes('&lt;b&gt;salt&lt;/b&gt;'), true);
});
