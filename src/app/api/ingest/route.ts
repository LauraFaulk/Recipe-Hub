import { runIngestionPipeline } from '../../../lib/ingest/pipeline';
import { IngestRequestSchema, IngestResponseSchema } from '../../../lib/validation/api-schemas';
import { getMedia } from '../../../lib/storage/media-store';
import { extractRawTextFromMedia } from '../../../lib/ocr/extract-raw-text';
import { parseRecipeFromText } from '../../../lib/parser/parse-recipe';
import { putRecipe } from '../../../lib/storage/recipe-store';

export async function POST(request: Request): Promise<Response> {
  const parsedBody = IngestRequestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return Response.json({ code: 'bad_request', message: 'mediaId is required' }, { status: 400 });
  }

  const media = getMedia(parsedBody.data.mediaId);
  if (!media) {
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

  return Response.json(response, { status: 200 });
}
