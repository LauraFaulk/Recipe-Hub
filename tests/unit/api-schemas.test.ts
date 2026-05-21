import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiErrorSchema, IngestResponseSchema, UploadResponseSchema } from '../../src/lib/validation/api-schemas.ts';

test('IngestResponseSchema rejects invalid status', () => {
  const result = IngestResponseSchema.safeParse({
    recipeId: 'rcp_1',
    confidence: 0.8,
    warnings: [],
    missingFields: [],
    status: 'done',
  });

  assert.equal(result.success, false);
});

test('IngestResponseSchema accepts valid payload', () => {
  const result = IngestResponseSchema.safeParse({
    recipeId: 'rcp_1',
    confidence: 0.8,
    warnings: ['warning'],
    missingFields: ['ingredients.0.amount'],
    status: 'failed',
  });

  assert.equal(result.success, true);
});

test('ApiErrorSchema rejects missing message', () => {
  const result = ApiErrorSchema.safeParse({ code: 'bad_request' });
  assert.equal(result.success, false);
});

test('ApiErrorSchema accepts valid payload with details', () => {
  const result = ApiErrorSchema.safeParse({
    code: 'bad_request',
    message: 'invalid input',
    details: { field: 'mediaId' },
  });

  assert.equal(result.success, true);
});

test('IngestResponseSchema rejects out-of-range confidence', () => {
  const result = IngestResponseSchema.safeParse({
    recipeId: 'rcp_1',
    confidence: 1.5,
    warnings: [],
    missingFields: [],
    status: 'ready_for_review',
  });

  assert.equal(result.success, false);
});

test('UploadResponseSchema rejects invalid storageUrl scheme', () => {
  const result = UploadResponseSchema.safeParse({
    mediaId: 'med_1',
    sourceType: 'image',
    storageUrl: 'ftp://example.com/file.png',
    status: 'uploaded',
  });

  assert.equal(result.success, false);
});

test('UploadResponseSchema accepts memory storage URL', () => {
  const result = UploadResponseSchema.safeParse({
    mediaId: 'med_1',
    sourceType: 'image',
    storageUrl: 'memory://med_1/photo.png',
    status: 'uploaded',
  });

  assert.equal(result.success, true);
});
