# Recipe Hub

Basic MVP scaffold for media upload, ingestion, and recipe review.

## Run

```bash
npm install
npm run dev
```

## Environment

```bash
cp .env.example .env.local
```

Adjust values in `.env.local` as needed for your local environment.

## Other scripts

```bash
npm run build
npm run start
npm run lint
npm run format
npm run format:write
npm test
```

Open:
- `/` home
- `/upload` upload + ingest flow
- `/recipes/<id>/edit` simple recipe JSON viewer
- `/telemetry` ingest telemetry dashboard
