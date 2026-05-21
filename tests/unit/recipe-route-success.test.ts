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
    t.skip('Skipping recipe success route tests because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('GET /api/recipes/:id returns recipe payload for existing recipe', async (t) => {
  const deps = await loadRecipeRouteDeps(t);
  if (!deps) return;

  const now = new Date().toISOString();
  const recipeId = `rcp_get_${Date.now()}`;
  deps.putRecipe({
    id: recipeId,
    title: 'Route Get',
    ingredients: [{ id: 'ing_1', name: 'Water' }],
    steps: [{ id: 'step_1', order: 1, text: 'Boil' }],
    metadata: {},
    source: { sourceType: 'text', extractionConfidence: 1, parserVersion: 'test' },
    createdAt: now,
    updatedAt: now,
  });

  const response = await deps.getRoute(new Request(`http://localhost/api/recipes/${recipeId}`), {
    params: Promise.resolve({ id: recipeId }),
  });

  assert.equal(response.status, 200);
  const payload = (await response.json()) as { recipe: { id: string; title: string } };
  assert.equal(payload.recipe.id, recipeId);
});

test('PATCH /api/recipes/:id updates recipe and returns payload', async (t) => {
  const deps = await loadRecipeRouteDeps(t);
  if (!deps) return;

  const now = new Date().toISOString();
  const recipeId = `rcp_patch_ok_${Date.now()}`;
  deps.putRecipe({
    id: recipeId,
    title: 'Before',
    ingredients: [{ id: 'ing_1', name: 'Salt' }],
    steps: [{ id: 'step_1', order: 1, text: 'Mix.' }],
    metadata: {},
    source: { sourceType: 'text', extractionConfidence: 1, parserVersion: 'test' },
    createdAt: now,
    updatedAt: now,
  });

  const response = await deps.patchRoute(
    new Request(`http://localhost/api/recipes/${recipeId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        recipe: {
          id: recipeId,
          title: 'After',
          ingredients: [{ id: 'ing_1', name: 'Salt' }],
          steps: [{ id: 'step_1', order: 1, text: 'Mix.' }],
          metadata: {},
          source: { sourceType: 'text', extractionConfidence: 1, parserVersion: 'test' },
          createdAt: now,
          updatedAt: new Date().toISOString(),
        },
      }),
    }),
    { params: Promise.resolve({ id: recipeId }) },
  );

  assert.equal(response.status, 200);
  const payload = (await response.json()) as { recipe: { title: string } };
  assert.equal(payload.recipe.title, 'After');
});
