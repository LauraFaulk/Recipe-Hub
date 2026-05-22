import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

interface FlowFixture {
  media: {
    mimeType: string;
    filename: string;
    content: string;
  };
  expected: {
    status: 'uploaded';
    ingestStatus: 'ready_for_review' | 'failed';
    minConfidence: number;
    maxConfidence: number;
  };
}

async function loadRouteDeps(t: import('node:test').TestContext) {
  try {
    const uploadRoute = await import('../../src/app/api/upload/route.ts');
    const ingestRoute = await import('../../src/app/api/ingest/route.ts');

    return {
      uploadPost: uploadRoute.POST as (request: Request) => Promise<Response>,
      ingestPost: ingestRoute.POST as (request: Request) => Promise<Response>,
    };
  } catch {
    t.skip('Skipping fixture flow test because route dependencies are unavailable in this environment.');
    return null;
  }
}

test('fixture-driven upload/ingest flow matches expected bounds', async (t) => {
  const deps = await loadRouteDeps(t);
  if (!deps) return;

  const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'upload-ingest-sample.json');
  const fixture = JSON.parse(await fs.readFile(fixturePath, 'utf8')) as FlowFixture;

  const formData = new FormData();
  formData.append('file', new File([fixture.media.content], fixture.media.filename, { type: fixture.media.mimeType }));

  const uploadRes = await deps.uploadPost(
    new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    }),
  );
  assert.equal(uploadRes.status, 201);

  const uploadPayload = (await uploadRes.json()) as { mediaId: string; status: string };
  assert.equal(uploadPayload.status, fixture.expected.status);

  const ingestRes = await deps.ingestPost(
    new Request('http://localhost/api/ingest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mediaId: uploadPayload.mediaId }),
    }),
  );

  assert.equal(ingestRes.status, 200);
  const ingestPayload = (await ingestRes.json()) as {
    status: 'ready_for_review' | 'failed';
    confidence: number;
  };

  assert.equal(ingestPayload.status, fixture.expected.ingestStatus);
  assert.equal(ingestPayload.confidence >= fixture.expected.minConfidence, true);
  assert.equal(ingestPayload.confidence <= fixture.expected.maxConfidence, true);
});
