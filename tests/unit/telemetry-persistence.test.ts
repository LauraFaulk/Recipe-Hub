import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { recordIngestEvent } from '../../src/lib/storage/telemetry-store.ts';

test('telemetry store persists events to disk file', () => {
  const mediaId = `med_telemetry_${Date.now()}`;

  recordIngestEvent({
    mediaId,
    recipeId: 'rcp_test',
    status: 'ready_for_review',
    warningCount: 0,
    missingFieldCount: 0,
    confidence: 0.95,
    createdAt: new Date().toISOString(),
  });

  const diskPath = path.join(process.cwd(), '.data', 'ingest-telemetry.json');
  assert.equal(fs.existsSync(diskPath), true);

  const raw = fs.readFileSync(diskPath, 'utf8');
  assert.equal(raw.includes(mediaId), true);
});
