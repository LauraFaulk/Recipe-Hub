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
- Trigger: push to `main` (or run the workflow manually from the Actions tab).

For local parity checks before pushing:

```bash
npm test
npm run build
npm run verify:pages
```

### If the live site still looks stale

1. Confirm Pages is configured to use **GitHub Actions** as the build/deploy source.
2. Confirm your latest commit landed on the `main` branch (the workflow triggers on `main` pushes).
3. Open the latest run of `.github/workflows/deploy-pages.yml` and verify `build` and `deploy` both passed.
4. Hard-refresh the browser (or use an incognito window) to avoid cached CSS/JS assets.
5. Verify the live URL is the repo Pages path: `https://<user>.github.io/Recipe-Hub/`.

### Post-deploy visual validation checklist

After a successful Pages deploy, verify the old-timey card experience on the live site:

- Home page shows a cream-toned background.
- Home page shows three dusty-rose recipe preview cards (Minimal / Cozy / Pro).
- Opening each variant link renders a styled recipe card page.
- `Export HTML` action is visible on the recipe card view.

### Deploy command (local gate)

Before pushing to `main`, run:

```bash
npm run verify:pages
```

This is the same gate used by the Pages workflow (`test` + `build`).


## Local data persistence

During development, runtime stores persist under `.data/`:
- `.data/media-records.json`
- `.data/recipes.json`
- `.data/ingest-telemetry.json`

Delete `.data/` if you want to reset local state.
