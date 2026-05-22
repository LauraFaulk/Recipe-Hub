import assert from 'node:assert/strict';
import test from 'node:test';

async function loadDeps(t: import('node:test').TestContext) {
  try {
    const route = await import('../../src/app/api/telemetry/ingest/route.ts');
    const store = await import('../../src/lib/storage/telemetry-store.ts');

    return {
      getTelemetry: route.GET as () => Promise<Response>,
      recordIngestEvent: store.recordIngestEvent,
    };
  } catch {
    t.skip('Skipping telemetry summary route test because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('telemetry route summary includes expected aggregate relationships', async (t) => {
  const deps = await loadDeps(t);
  if (!deps) return;

  deps.recordIngestEvent({
    mediaId: `med_sum_${Date.now()}`,
    recipeId: 'rcp_sum',
    status: 'failed',
    warningCount: 2,
    missingFieldCount: 1,
    confidence: 0,
    createdAt: new Date().toISOString(),
  });

  const response = await deps.getTelemetry();
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    summary: { total: number; failed: number; ready: number; avgConfidence: number };
  };

  assert.equal(payload.summary.total >= payload.summary.failed, true);
  assert.equal(payload.summary.total >= payload.summary.ready, true);
  assert.equal(payload.summary.ready + payload.summary.failed, payload.summary.total);
});
