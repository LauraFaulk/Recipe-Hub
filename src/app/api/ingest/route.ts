import { runIngestionPipeline } from '../../../lib/ingest/pipeline.ts';
import { IngestRequestSchema, IngestResponseSchema } from '../../../lib/validation/api-schemas.ts';
import { getMedia } from '../../../lib/storage/media-store.ts';
import { extractRawTextFromMedia } from '../../../lib/ocr/extract-raw-text.ts';
import { parseRecipeFromText } from '../../../lib/parser/parse-recipe.ts';
import { putRecipe } from '../../../lib/storage/recipe-store.ts';
import { recordIngestEvent } from '../../../lib/storage/telemetry-store.ts';

export async function POST(request: Request): Promise<Response> {
  const parsedBody = IngestRequestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    recordIngestEvent({
      mediaId: 'unknown',
      status: 'failed',
      warningCount: 1,
      missingFieldCount: 1,
      confidence: 0,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ code: 'bad_request', message: 'mediaId is required' }, { status: 400 });
  }

  const media = getMedia(parsedBody.data.mediaId);
  if (!media) {
    recordIngestEvent({
      mediaId: parsedBody.data.mediaId,
      status: 'failed',
      warningCount: 1,
      missingFieldCount: 1,
      confidence: 0,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ code: 'not_found', message: 'media not found' }, { status: 404 });
  }

  const result = await runIngestionPipeline(parsedBody.data.mediaId, media.sourceType, {
    extractRawText: extractRawTextFromMedia,
    parseRecipe: parseRecipeFromText,
  });

  putRecipe(result.recipe);

  const response = IngestResponseSchema.parse({
    recipeId: result.recipe.id,
    confidence: result.recipe.source.extractionConfidence,
    warnings: result.warnings,
    missingFields: result.missingFields,
    status: result.warnings.length ? 'failed' : 'ready_for_review',
  });

  recordIngestEvent({
    mediaId: parsedBody.data.mediaId,
    recipeId: response.recipeId,
    status: response.status,
    warningCount: response.warnings.length,
    missingFieldCount: response.missingFields.length,
    confidence: response.confidence,
    createdAt: new Date().toISOString(),
  });

  return Response.json(response, { status: 200 });
}
