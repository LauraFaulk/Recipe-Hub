import assert from 'node:assert/strict';
import test from 'node:test';

import { getIngestTelemetrySummary, listIngestEvents, recordIngestEvent } from '../../src/lib/storage/telemetry-store.ts';

test('telemetry store records events and computes summary', () => {
  recordIngestEvent({
    mediaId: 'med_1',
    recipeId: 'rcp_1',
    status: 'ready_for_review',
    warningCount: 0,
    missingFieldCount: 0,
    confidence: 0.9,
    createdAt: new Date().toISOString(),
  });

  recordIngestEvent({
    mediaId: 'med_2',
    recipeId: 'rcp_2',
    status: 'failed',
    warningCount: 1,
    missingFieldCount: 2,
    confidence: 0.3,
    createdAt: new Date().toISOString(),
  });

  const summary = getIngestTelemetrySummary();
  assert.equal(summary.total >= 2, true);
  assert.equal(summary.failed >= 1, true);
  assert.equal(summary.ready >= 1, true);
  assert.equal(summary.avgConfidence >= 0, true);
  assert.equal(summary.avgConfidence <= 1, true);

  const events = listIngestEvents(2);
  assert.equal(events.length <= 2, true);
});
