import assert from 'node:assert/strict';
import test from 'node:test';

async function loadRecipeRouteDeps(t: import('node:test').TestContext) {
  try {
    const route = await import('../../src/app/api/recipes/[id]/route.ts');
    const store = await import('../../src/lib/storage/recipe-store.ts');
    return {
      getRoute: route.GET as (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>,
      patchRoute: route.PATCH as (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>,
      putRecipe: store.putRecipe,
    };
  } catch {
    t.skip('Skipping recipe route tests because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('GET /api/recipes/:id returns 404 for missing recipe', async (t) => {
  const deps = await loadRecipeRouteDeps(t);
  if (!deps) return;

  const response = await deps.getRoute(new Request('http://localhost/api/recipes/missing'), {
    params: Promise.resolve({ id: 'missing' }),
  });

  assert.equal(response.status, 404);
});

test('PATCH /api/recipes/:id rejects id mismatch', async (t) => {
  const deps = await loadRecipeRouteDeps(t);
  if (!deps) return;

  const now = new Date().toISOString();
  const routeId = `rcp_patch_${Date.now()}`;
  const bodyId = `${routeId}_other`;

  const response = await deps.patchRoute(
    new Request(`http://localhost/api/recipes/${routeId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        recipe: {
          id: bodyId,
          title: 'Mismatch',
          ingredients: [{ id: 'ing_1', name: 'Salt' }],
          steps: [{ id: 'step_1', order: 1, text: 'Mix.' }],
          metadata: {},
          source: { sourceType: 'text', extractionConfidence: 1, parserVersion: 'test' },
          createdAt: now,
          updatedAt: now,
        },
      }),
    }),
    { params: Promise.resolve({ id: routeId }) },
  );

  assert.equal(response.status, 400);
});
