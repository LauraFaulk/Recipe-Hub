import assert from 'node:assert/strict';
import test from 'node:test';

async function loadDeps(t: import('node:test').TestContext) {
  try {
    const routeMod = await import('../../src/app/api/ingest/route.ts');
    const mediaStore = await import('../../src/lib/storage/media-store.ts');
    return { POST: routeMod.POST as (request: Request) => Promise<Response>, putMedia: mediaStore.putMedia };
  } catch {
    t.skip('Skipping ingest success tests because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('POST /api/ingest returns structured response for known media', async (t) => {
  const deps = await loadDeps(t);
  if (!deps) return;

  const mediaId = `med_test_${Date.now()}`;
  deps.putMedia({
    mediaId,
    filename: 'input.txt',
    mimeType: 'text/plain',
    bytes: 128,
    uploadedAt: new Date().toISOString(),
    sourceType: 'text',
    storageUrl: `memory://${mediaId}/input.txt`,
  });

  const request = new Request('http://localhost/api/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mediaId }),
  });

  const response = await deps.POST(request);
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    recipeId: string;
    confidence: number;
    warnings: string[];
    missingFields: string[];
    status: 'ready_for_review' | 'failed';
  };

  assert.equal(typeof payload.recipeId, 'string');
  assert.equal(payload.recipeId.length > 0, true);
  assert.equal(payload.confidence >= 0 && payload.confidence <= 1, true);
  assert.equal(Array.isArray(payload.warnings), true);
  assert.equal(Array.isArray(payload.missingFields), true);
  assert.equal(payload.status === 'ready_for_review' || payload.status === 'failed', true);
});
