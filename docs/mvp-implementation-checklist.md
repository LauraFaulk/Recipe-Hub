# Recipe-Hub MVP Implementation Checklist

## Goal
Ship a vertical slice that supports:
1. Upload a screenshot image.
2. Extract ingredient/step text with AI.
3. Let user edit extracted output.
4. Render a visually appealing recipe card.

---

## Phase 0 — Project setup
- [x] Initialize Next.js app (`app` router, TypeScript, Tailwind).
- [x] Add linting/formatting (ESLint + Prettier).
- [x] Add env management with `.env.example`.
- [x] Set up package scripts for `dev`, `build`, `test`, and `lint`.

Deliverable: clean booting web app.

## Phase 1 — Data contracts + validation
- [x] Add canonical `Recipe` interfaces in `src/types/recipe.ts`.
- [x] Add `zod` runtime schema validation in `src/lib/validation/recipe-schema.ts`.
- [x] Create API contract types for upload/ingest endpoints.
- [x] Add unit tests for valid/invalid recipe payloads.

Deliverable: strict data model used across frontend + backend.

## Phase 2 — Upload flow
- [x] Build upload UI (drag/drop + file picker).
- [x] Validate file type/size client-side.
- [x] Implement upload endpoint and object storage integration.
- [ ] Persist uploaded media record in DB.

Deliverable: image is uploaded and tracked with a media ID.

## Phase 3 — Ingestion pipeline (image-first)
- [x] Implement media-type detection and routing.
- [x] Extract raw text from uploaded screenshot (OCR or direct vision model).
- [x] Parse text into structured recipe JSON using LLM prompt.
- [x] Validate model output against `RecipeSchema`.
- [x] Save parse warnings + confidence score.

Deliverable: `Recipe` object produced automatically from image.

## Phase 4 — Human-in-the-loop editor
- [x] Build recipe editor for title, ingredients, and steps.
- [x] Add reorder/edit/delete/add for instruction steps.
- [x] Add warnings UI for low-confidence extraction.
- [x] Save edited recipe back to DB.

Deliverable: user can quickly fix imperfect AI extraction.

## Phase 5 — Recipe card rendering
- [x] Build first template (`MinimalCard`).
- [ ] Add style variants selector (Minimal/Cozy/Pro placeholders).
- [x] Add print-friendly “cook mode” view.
- [ ] Add export endpoint (PNG or PDF).

Deliverable: polished, usable recipe card for cooking.

## Phase 6 — Quality + instrumentation
- [ ] Add integration tests for upload → ingest → render flow.
- [ ] Add fixture set with expected extraction JSON.
- [ ] Add telemetry for extraction errors and schema failures.
- [x] Add retry and fallback messaging in UI.

Deliverable: stable MVP with measurable extraction quality.

---

## Suggested first 10 tickets
1. Bootstrap Next.js + Tailwind project.
2. Add recipe interfaces and zod schema.
3. Create upload page shell.
4. Add upload API route + file storage integration.
5. Create ingest route skeleton and pipeline orchestrator.
6. Implement LLM prompt + schema-constrained parsing.
7. Build recipe edit form.
8. Save recipes API route.
9. Implement minimal recipe card component.
10. Add end-to-end happy path test fixture.
