import { getIngestTelemetrySummary, listIngestEvents } from '../../lib/storage/telemetry-store';

export default function TelemetryPage() {
  const summary = getIngestTelemetrySummary();
  const events = listIngestEvents(25);

  return (
    <main className="container stack">
      <h1>Ingestion Telemetry</h1>
      <p>
        Total: {summary.total} · Ready: {summary.ready} · Failed: {summary.failed} · Avg confidence:{' '}
        {summary.avgConfidence.toFixed(2)}
      </p>

      <section className="stack">
        <h2>Recent Events</h2>
        {events.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          <ul>
            {events.map((event) => (
              <li key={`${event.mediaId}-${event.createdAt}`}>
                {event.createdAt}: {event.status} | media={event.mediaId} | recipe={event.recipeId ?? '-'} |
                warnings={event.warningCount} | missing={event.missingFieldCount} | confidence={event.confidence.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
