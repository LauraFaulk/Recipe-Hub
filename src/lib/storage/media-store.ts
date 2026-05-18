export interface MediaRecord {
  mediaId: string;
  filename: string;
  mimeType: string;
  bytes: number;
  uploadedAt: string;
  sourceType: 'image' | 'video' | 'text';
  storageUrl: string;
}

const media = new Map<string, MediaRecord>();

export function putMedia(record: MediaRecord): MediaRecord {
  media.set(record.mediaId, record);
  return record;
}

export function getMedia(mediaId: string): MediaRecord | undefined {
  return media.get(mediaId);
}
