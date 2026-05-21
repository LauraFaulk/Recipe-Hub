import fs from 'node:fs';
import path from 'node:path';

export interface IngestTelemetryEvent {
  mediaId: string;
  recipeId?: string;
  status: 'ready_for_review' | 'failed';
  warningCount: number;
  missingFieldCount: number;
  confidence: number;
  createdAt: string;
}

const ingestEvents: IngestTelemetryEvent[] = [];
const dataDir = path.join(process.cwd(), '.data');
const telemetryFilePath = path.join(dataDir, 'ingest-telemetry.json');

function loadTelemetryFromDisk() {
  try {
    if (!fs.existsSync(telemetryFilePath)) {
      return;
    }

    const raw = fs.readFileSync(telemetryFilePath, 'utf8');
    const parsed = JSON.parse(raw) as IngestTelemetryEvent[];
    ingestEvents.push(...parsed);
  } catch {
    // Ignore malformed/missing disk data and continue with in-memory events.
  }
}

function persistTelemetryToDisk() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(telemetryFilePath, JSON.stringify(ingestEvents, null, 2), 'utf8');
  } catch {
    // Keep API non-fatal if disk persistence fails in constrained environments.
  }
}

loadTelemetryFromDisk();

export function recordIngestEvent(event: IngestTelemetryEvent): IngestTelemetryEvent {
  ingestEvents.push(event);
  persistTelemetryToDisk();
  return event;
}

export function listIngestEvents(limit = 50): IngestTelemetryEvent[] {
  return ingestEvents.slice(-limit).reverse();
}

export function getIngestTelemetrySummary() {
  const total = ingestEvents.length;
  const failed = ingestEvents.filter((event) => event.status === 'failed').length;
  const ready = total - failed;

  const avgConfidence = total
    ? ingestEvents.reduce((sum, event) => sum + event.confidence, 0) / total
    : 0;

  return {
    total,
    failed,
    ready,
    avgConfidence,
  };
}
