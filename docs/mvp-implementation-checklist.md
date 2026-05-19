# Recipe-Hub MVP Implementation Checklist

## Goal
Ship a vertical slice that supports:
1. Upload a screenshot image.
2. Extract ingredient/step text with AI.
3. Let user edit extracted output.
4. Render a visually appealing recipe card.

---

## Phase 0 — Project setup
- [ ] Initialize Next.js app (`app` router, TypeScript, Tailwind).
- [ ] Add linting/formatting (ESLint + Prettier).
- [x] Add env management with `.env.example`.
- [x] Set up package scripts for `dev`, `build`, `test`, and `lint`.

Deliverable: clean booting web app.

## Phase 1 — Data contracts + validation
- [ ] Add canonical `Recipe` interfaces in `src/types/recipe.ts`.
- [ ] Add `zod` runtime schema validation in `src/lib/validation/recipe-schema.ts`.
- [ ] Create API contract types for upload/ingest endpoints.
- [ ] Add unit tests for valid/invalid recipe payloads.

Deliverable: strict data model used across frontend + backend.

## Phase 2 — Upload flow
- [ ] Build upload UI (drag/drop + file picker).
- [ ] Validate file type/size client-side.
- [ ] Implement upload endpoint and object storage integration.
- [ ] Persist uploaded media record in DB.

Deliverable: image is uploaded and tracked with a media ID.

## Phase 3 — Ingestion pipeline (image-first)
- [ ] Implement media-type detection and routing.
- [ ] Extract raw text from uploaded screenshot (OCR or direct vision model).
- [ ] Parse text into structured recipe JSON using LLM prompt.
- [ ] Validate model output against `RecipeSchema`.
- [ ] Save parse warnings + confidence score.

Deliverable: `Recipe` object produced automatically from image.

## Phase 4 — Human-in-the-loop editor
- [ ] Build recipe editor for title, ingredients, and steps.
- [ ] Add reorder/edit/delete/add for instruction steps.
- [ ] Add warnings UI for low-confidence extraction.
- [ ] Save edited recipe back to DB.

Deliverable: user can quickly fix imperfect AI extraction.

## Phase 5 — Recipe card rendering
- [ ] Build first template (`MinimalCard`).
- [ ] Add style variants selector (Minimal/Cozy/Pro placeholders).
- [ ] Add print-friendly “cook mode” view.
- [ ] Add export endpoint (PNG or PDF).

Deliverable: polished, usable recipe card for cooking.

## Phase 6 — Quality + instrumentation
- [ ] Add integration tests for upload → ingest → render flow.
- [ ] Add fixture set with expected extraction JSON.
- [ ] Add telemetry for extraction errors and schema failures.
- [ ] Add retry and fallback messaging in UI.

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
