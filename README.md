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
- `/recipes/<id>/card?variant=minimal|cozy|pro` card variants + export action
- `/telemetry` ingest telemetry dashboard

## Release hardening (post-MVP)

Track remaining deployment-readiness tasks in `docs/mvp-implementation-checklist.md` (Phase 7), including:
- manual acceptance pass across core routes
- clean `build` + `lint` in target environment
- deployment env/secret finalization
- export roadmap decision (HTML-only vs PNG/PDF follow-up)
- basic ingest-failure monitoring setup

## Suggested verification runbook

Use this quick sequence before cutting a release candidate:

```bash
npm test
npm run lint
npm run build
```

Then do a manual smoke pass through `/upload`, `/recipes/<id>/card`, `/recipes/<id>/export`, and `/telemetry`.

## GitHub Pages deployment

This repository is configured to publish a static Next.js export to GitHub Pages from the `main` branch via Actions.

- Config file: `next.config.ts` (uses `output: 'export'` and applies `/Recipe-Hub` base path in Actions).
- Workflow: `.github/workflows/deploy-pages.yml`.
- Published artifact directory: `out/`.

For local parity checks before pushing:

```bash
npm test
npm run build
```


## Local data persistence

During development, runtime stores persist under `.data/`:
- `.data/media-records.json`
- `.data/recipes.json`
- `.data/ingest-telemetry.json`

Delete `.data/` if you want to reset local state.
