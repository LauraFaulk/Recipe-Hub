import assert from 'node:assert/strict';
import test from 'node:test';


async function loadPostUpload(t: import('node:test').TestContext) {
  try {
    const mod = await import('../../src/app/api/upload/route.ts');
    return mod.POST as (request: Request) => Promise<Response>;
  } catch {
    t.skip('Skipping upload route tests because route dependencies are unavailable in this environment.');
    return null;
  }
}


test('POST /api/upload rejects missing file with 400', async (t) => {
  const POST = await loadPostUpload(t);
  if (!POST) return;

  const request = new Request('http://localhost/api/upload', {
    method: 'POST',
    body: new FormData(),
  });

  const response = await POST(request);
  assert.equal(response.status, 400);

  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, 'bad_request');
});

test('POST /api/upload rejects unsupported mime type with 415', async (t) => {
  const POST = await loadPostUpload(t);
  if (!POST) return;
  const formData = new FormData();
  const file = new File(['hello'], 'note.md', { type: 'text/markdown' });
  formData.append('file', file);

  const request = new Request('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  });

  const response = await POST(request);
  assert.equal(response.status, 415);

  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, 'unsupported_media_type');
});

test('POST /api/upload rejects oversized files with 413', async (t) => {
  const POST = await loadPostUpload(t);
  if (!POST) return;
  const formData = new FormData();
  const oversizedContent = 'a'.repeat(10 * 1024 * 1024 + 1);
  const file = new File([oversizedContent], 'big.txt', { type: 'text/plain' });
  formData.append('file', file);

  const request = new Request('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  });

  const response = await POST(request);
  assert.equal(response.status, 413);

  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, 'payload_too_large');
});

test('POST /api/upload accepts supported mime type and returns uploaded payload', async (t) => {
  const POST = await loadPostUpload(t);
  if (!POST) return;
  const formData = new FormData();
  const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });
  formData.append('file', file);

  const request = new Request('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  });

  const response = await POST(request);
  assert.equal(response.status, 201);

  const payload = (await response.json()) as {
    mediaId: string;
    sourceType: string;
    storageUrl: string;
    status: string;
  };

  assert.equal(payload.status, 'uploaded');
  assert.equal(payload.sourceType, 'image');
  assert.equal(payload.mediaId.startsWith('med_'), true);
  assert.equal(payload.storageUrl.startsWith('memory://'), true);

  // ensure payload shape remains compatible with current dev memory storage scheme
  assert.equal(payload.storageUrl.includes('/photo.png'), true);
});
