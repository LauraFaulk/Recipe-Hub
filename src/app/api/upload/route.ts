import { UploadResponseSchema } from '../../../lib/validation/api-schemas';
import { putMedia } from '../../../lib/storage/media-store';

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return Response.json({ code: 'bad_request', message: 'file is required' }, { status: 400 });
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
