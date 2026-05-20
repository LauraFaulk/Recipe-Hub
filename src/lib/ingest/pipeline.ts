import type { RecipeExtractionResult, Recipe } from '../../types/recipe';
import { safeValidateRecipe } from '../validation/recipe-schema';

export interface PipelineDependencies {
  extractRawText: (mediaId: string) => Promise<string>;
  parseRecipe: (rawText: string, mediaId: string, sourceType: 'image' | 'video' | 'text') => Promise<unknown>;
}

export async function runIngestionPipeline(
  mediaId: string,
  sourceType: 'image' | 'video' | 'text',
  deps: PipelineDependencies,
): Promise<RecipeExtractionResult> {
  const rawText = await deps.extractRawText(mediaId);
  const parsed = await deps.parseRecipe(rawText, mediaId, sourceType);

  const validated = safeValidateRecipe(parsed);
  if (!validated.success) {
    const missingFields = validated.error.issues.map((issue) => issue.path.join('.'));
    const warnings = ['Recipe parse failed schema validation.'];
    return {
      recipe: buildFallbackRecipe(mediaId, sourceType, rawText, warnings, missingFields),
      warnings,
      missingFields,
    };
  }

  return {
    recipe: {
      ...validated.data,
      source: {
        ...validated.data.source,
        parseWarnings: [],
        missingFields: [],
      },
    },
    warnings: [],
    missingFields: [],
  };
}

function buildFallbackRecipe(
  mediaId: string,
  sourceType: 'image' | 'video' | 'text',
  rawText: string,
  warnings: string[],
  missingFields: string[],
): Recipe {
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
      sourceType,
      rawExtractedText: rawText,
      extractionConfidence: 0,
      parserVersion: 'v0-fallback',
      parseWarnings: warnings,
      missingFields,
    },
    createdAt: now,
    updatedAt: now,
  };
}
