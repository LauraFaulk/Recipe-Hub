import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { getMedia, putMedia } from '../../src/lib/storage/media-store.ts';

test('media store persists uploaded records to disk file', () => {
  const mediaId = `med_disk_${Date.now()}`;
  const record = {
    mediaId,
    filename: 'sample.txt',
    mimeType: 'text/plain',
    bytes: 12,
    uploadedAt: new Date().toISOString(),
    sourceType: 'text' as const,
    storageUrl: `memory://${mediaId}/sample.txt`,
  };

  putMedia(record);

  const loaded = getMedia(mediaId);
  assert.equal(loaded?.mediaId, mediaId);

  const diskPath = path.join(process.cwd(), '.data', 'media-records.json');
  assert.equal(fs.existsSync(diskPath), true);

  const raw = fs.readFileSync(diskPath, 'utf8');
  assert.equal(raw.includes(mediaId), true);
});
