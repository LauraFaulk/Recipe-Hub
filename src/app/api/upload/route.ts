import { UploadResponseSchema } from '../../../lib/validation/api-schemas.ts';
import { putMedia } from '../../../lib/storage/media-store.ts';


const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'text/plain']);


const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'text/plain']);

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return Response.json({ code: 'bad_request', message: 'file is required' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return Response.json({ code: 'unsupported_media_type', message: 'unsupported file type' }, { status: 415 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ code: 'payload_too_large', message: 'file exceeds 10MB limit' }, { status: 413 });
  }

  const mediaId = `med_${crypto.randomUUID()}`;
  const sourceType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('text/') ? 'text' : 'image';
  const storageUrl = `memory://${mediaId}/${file.name}`;

  putMedia({
    mediaId,
    filename: file.name,
    mimeType: file.type,
    bytes: file.size,
    uploadedAt: new Date().toISOString(),
    sourceType,
    storageUrl,
  });

  const payload = UploadResponseSchema.parse({
    mediaId,
    sourceType,
    storageUrl,
    status: 'uploaded',
  });

  return Response.json(payload, { status: 201 });
}
