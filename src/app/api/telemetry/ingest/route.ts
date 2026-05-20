import { getIngestTelemetrySummary, listIngestEvents } from '../../../../lib/storage/telemetry-store';

export async function GET(): Promise<Response> {
  const summary = getIngestTelemetrySummary();
  const events = listIngestEvents(25);

  return Response.json({
    summary,
    events,
  });
}
