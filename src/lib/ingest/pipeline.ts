import type { RecipeExtractionResult, Recipe } from '../../types/recipe';
import { safeValidateRecipe } from '../validation/recipe-schema';

export interface PipelineDependencies {
  extractRawText: (mediaId: string) => Promise<string>;
  parseRecipe: (rawText: string, mediaId: string) => Promise<unknown>;
}

export async function runIngestionPipeline(
  mediaId: string,
  deps: PipelineDependencies,
): Promise<RecipeExtractionResult> {
  const rawText = await deps.extractRawText(mediaId);
  const parsed = await deps.parseRecipe(rawText, mediaId);

  const validated = safeValidateRecipe(parsed);
  if (!validated.success) {
    const missingFields = validated.error.issues.map((issue) => issue.path.join('.'));
    return {
      recipe: buildFallbackRecipe(mediaId, rawText),
      warnings: ['Recipe parse failed schema validation.'],
      missingFields,
    };
  }

  return {
    recipe: validated.data,
    warnings: [],
    missingFields: [],
  };
}

function buildFallbackRecipe(mediaId: string, rawText: string): Recipe {
  const now = new Date().toISOString();
  return {
    id: `draft_${mediaId}`,
    title: 'Untitled Recipe (Needs Review)',
    ingredients: [
      {
        id: 'ing_1',
        name: 'Unknown ingredient',
        notes: 'Failed to parse ingredients automatically.',
      },
    ],
    steps: [
      {
        id: 'step_1',
        order: 1,
        text: 'Review extracted text and add cooking instructions manually.',
      },
    ],
    metadata: {},
    source: {
      sourceType: 'image',
      rawExtractedText: rawText,
      extractionConfidence: 0,
      parserVersion: 'v0-fallback',
    },
    createdAt: now,
    updatedAt: now,
  };
}
