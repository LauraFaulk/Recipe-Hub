import assert from 'node:assert/strict';
import test from 'node:test';

import { listIngestEvents, recordIngestEvent } from '../../src/lib/storage/telemetry-store.ts';

test('listIngestEvents respects limit and returns newest-first', () => {
  const base = Date.now();

  recordIngestEvent({
    mediaId: `med_limit_${base}_1`,
    recipeId: 'rcp_1',
    status: 'ready_for_review',
    warningCount: 0,
    missingFieldCount: 0,
    confidence: 0.9,
    createdAt: new Date(base).toISOString(),
  });

  recordIngestEvent({
    mediaId: `med_limit_${base}_2`,
    recipeId: 'rcp_2',
    status: 'failed',
    warningCount: 1,
    missingFieldCount: 1,
    confidence: 0.2,
    createdAt: new Date(base + 1).toISOString(),
  });

  const events = listIngestEvents(1);
  assert.equal(events.length, 1);
  assert.equal(events[0]?.mediaId, `med_limit_${base}_2`);
});
