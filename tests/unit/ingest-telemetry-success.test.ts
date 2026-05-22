import assert from 'node:assert/strict';
import test from 'node:test';

async function loadDeps(t: import('node:test').TestContext) {
  try {
    const uploadRoute = await import('../../src/app/api/upload/route.ts');
    const ingestRoute = await import('../../src/app/api/ingest/route.ts');
    const telemetryStore = await import('../../src/lib/storage/telemetry-store.ts');

    return {
      uploadPost: uploadRoute.POST as (request: Request) => Promise<Response>,
      ingestPost: ingestRoute.POST as (request: Request) => Promise<Response>,
      getSummary: telemetryStore.getIngestTelemetrySummary,
    };
  } catch {
    t.skip('Skipping ingest telemetry success test because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('ingest success records telemetry event and increments total', async (t) => {
  const deps = await loadDeps(t);
  if (!deps) return;

  const before = deps.getSummary();

  const formData = new FormData();
  formData.append('file', new File(['fixture'], 'ok.txt', { type: 'text/plain' }));

  const uploadRes = await deps.uploadPost(
    new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    }),
  );
  assert.equal(uploadRes.status, 201);

  const uploadPayload = (await uploadRes.json()) as { mediaId: string };

  const ingestRes = await deps.ingestPost(
    new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mediaId: uploadPayload.mediaId }),
    }),
  );

  assert.equal(ingestRes.status, 200);

  const after = deps.getSummary();
  assert.equal(after.total, before.total + 1);
});
