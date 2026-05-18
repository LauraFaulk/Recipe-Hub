'use client';

import { useState } from 'react';

export function UploadForm() {
  const [status, setStatus] = useState<string>('Idle');
  const [mediaId, setMediaId] = useState<string>('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('file') as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      setStatus('Please select a file first.');
      return;
    }

    setStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!uploadResponse.ok) {
      setStatus('Upload failed.');
      return;
    }

    const uploadPayload = (await uploadResponse.json()) as { mediaId: string };
    setMediaId(uploadPayload.mediaId);

    setStatus('Ingesting...');
    const ingestResponse = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mediaId: uploadPayload.mediaId }),
    });

    if (!ingestResponse.ok) {
      setStatus('Ingestion failed.');
      return;
    }

    const ingestPayload = (await ingestResponse.json()) as { recipeId: string };
    setStatus(`Done. Recipe ready: ${ingestPayload.recipeId}`);
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <input type="file" name="file" accept="image/*,video/*,text/plain" />
      <button type="submit" className="button">
        Upload and Ingest
      </button>
      <p>{status}</p>
      {mediaId ? <p>Last media ID: {mediaId}</p> : null}
    </form>
  );
}
