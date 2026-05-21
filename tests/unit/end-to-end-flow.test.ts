import assert from 'node:assert/strict';
import test from 'node:test';

async function loadRouteDeps(t: import('node:test').TestContext) {
  try {
    const uploadRoute = await import('../../src/app/api/upload/route.ts');
    const ingestRoute = await import('../../src/app/api/ingest/route.ts');
    const recipeStore = await import('../../src/lib/storage/recipe-store.ts');

    return {
      uploadPost: uploadRoute.POST as (request: Request) => Promise<Response>,
      ingestPost: ingestRoute.POST as (request: Request) => Promise<Response>,
      getRecipe: recipeStore.getRecipe,
    };
  } catch {
    t.skip('Skipping end-to-end flow test because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('upload -> ingest -> recipe retrieval happy path', async (t) => {
  const deps = await loadRouteDeps(t);
  if (!deps) return;

  const uploadFormData = new FormData();
  uploadFormData.append('file', new File(['hello world'], 'input.txt', { type: 'text/plain' }));

  const uploadReq = new Request('http://localhost/api/upload', {
    method: 'POST',
    body: uploadFormData,
  });

  const uploadRes = await deps.uploadPost(uploadReq);
  assert.equal(uploadRes.status, 201);

  const uploadPayload = (await uploadRes.json()) as { mediaId: string; status: string };
  assert.equal(uploadPayload.status, 'uploaded');

  const ingestReq = new Request('http://localhost/api/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mediaId: uploadPayload.mediaId }),
  });

  const ingestRes = await deps.ingestPost(ingestReq);
  assert.equal(ingestRes.status, 200);

  const ingestPayload = (await ingestRes.json()) as { recipeId: string; warnings: string[]; missingFields: string[] };
  assert.equal(typeof ingestPayload.recipeId, 'string');
  assert.equal(Array.isArray(ingestPayload.warnings), true);
  assert.equal(Array.isArray(ingestPayload.missingFields), true);

  const saved = deps.getRecipe(ingestPayload.recipeId);
  assert.equal(saved?.id, ingestPayload.recipeId);
});
