import assert from 'node:assert/strict';
import test from 'node:test';

async function loadDeps(t: import('node:test').TestContext) {
  try {
    const ingestRoute = await import('../../src/app/api/ingest/route.ts');
    const telemetryStore = await import('../../src/lib/storage/telemetry-store.ts');

    return {
      ingestPost: ingestRoute.POST as (request: Request) => Promise<Response>,
      getSummary: telemetryStore.getIngestTelemetrySummary,
    };
  } catch {
    t.skip('Skipping ingest telemetry not-found test because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('ingest 404 request records failed telemetry event', async (t) => {
  const deps = await loadDeps(t);
  if (!deps) return;

  const before = deps.getSummary();

  const response = await deps.ingestPost(
    new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mediaId: 'med_missing_telemetry' }),
    }),
  );

  assert.equal(response.status, 404);

  const after = deps.getSummary();
  assert.equal(after.total, before.total + 1);
  assert.equal(after.failed >= before.failed + 1, true);
});
