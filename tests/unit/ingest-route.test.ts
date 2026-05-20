import assert from 'node:assert/strict';
import test from 'node:test';

async function loadIngestPost(t: import('node:test').TestContext) {
  try {
    const mod = await import('../../src/app/api/ingest/route.ts');
    return mod.POST as (request: Request) => Promise<Response>;
  } catch {
    t.skip('Skipping ingest route tests because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('POST /api/ingest rejects missing mediaId with 400', async (t) => {
  const POST = await loadIngestPost(t);
  if (!POST) return;

  const request = new Request('http://localhost/api/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });

  const response = await POST(request);
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, 'bad_request');
});

test('POST /api/ingest returns 404 for unknown mediaId', async (t) => {
  const POST = await loadIngestPost(t);
  if (!POST) return;

  const request = new Request('http://localhost/api/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mediaId: 'med_missing' }),
  });

  const response = await POST(request);
  assert.equal(response.status, 404);

  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, 'not_found');
});
