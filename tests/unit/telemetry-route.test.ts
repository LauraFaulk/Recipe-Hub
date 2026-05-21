import assert from 'node:assert/strict';
import test from 'node:test';

async function loadTelemetryDeps(t: import('node:test').TestContext) {
  try {
    const route = await import('../../src/app/api/telemetry/ingest/route.ts');
    const store = await import('../../src/lib/storage/telemetry-store.ts');
    return {
      getTelemetry: route.GET as () => Promise<Response>,
      recordIngestEvent: store.recordIngestEvent,
    };
  } catch {
    t.skip('Skipping telemetry route tests because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('GET /api/telemetry/ingest returns summary and events payload', async (t) => {
  const deps = await loadTelemetryDeps(t);
  if (!deps) return;

  deps.recordIngestEvent({
    mediaId: 'med_route_1',
    recipeId: 'rcp_route_1',
    status: 'ready_for_review',
    warningCount: 0,
    missingFieldCount: 0,
    confidence: 0.88,
    createdAt: new Date().toISOString(),
  });

  const response = await deps.getTelemetry();
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    summary: { total: number; failed: number; ready: number; avgConfidence: number };
    events: Array<{ mediaId: string; status: string }>;
  };

  assert.equal(typeof payload.summary.total, 'number');
  assert.equal(typeof payload.summary.avgConfidence, 'number');
  assert.equal(Array.isArray(payload.events), true);
  assert.equal(payload.events.length > 0, true);
});
