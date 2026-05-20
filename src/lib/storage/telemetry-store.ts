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

export function recordIngestEvent(event: IngestTelemetryEvent): IngestTelemetryEvent {
  ingestEvents.push(event);
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
