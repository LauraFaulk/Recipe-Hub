import fs from 'node:fs';
import path from 'node:path';

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
const dataDir = path.join(process.cwd(), '.data');
const mediaFilePath = path.join(dataDir, 'media-records.json');

function loadMediaFromDisk() {
  try {
    if (!fs.existsSync(mediaFilePath)) {
      return;
    }

    const raw = fs.readFileSync(mediaFilePath, 'utf8');
    const parsed = JSON.parse(raw) as MediaRecord[];
    for (const record of parsed) {
      media.set(record.mediaId, record);
    }
  } catch {
    // Ignore malformed/missing disk data and continue with in-memory map.
  }
}

function persistMediaToDisk() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    const payload = JSON.stringify(Array.from(media.values()), null, 2);
    fs.writeFileSync(mediaFilePath, payload, 'utf8');
  } catch {
    // Keep API non-fatal if disk persistence fails in constrained environments.
  }
}

loadMediaFromDisk();

export function putMedia(record: MediaRecord): MediaRecord {
  media.set(record.mediaId, record);
  persistMediaToDisk();
  return record;
}

export function getMedia(mediaId: string): MediaRecord | undefined {
  return media.get(mediaId);
}
