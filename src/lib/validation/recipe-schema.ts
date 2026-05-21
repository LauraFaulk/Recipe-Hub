import type { Recipe } from '../../types/recipe.ts';

type Issue = { path: Array<string | number>; message: string };

type SafeParseSuccess<T> = { success: true; data: T };
type SafeParseFailure = { success: false; error: { issues: Issue[] } };
type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function push(issues: Issue[], path: Array<string | number>, message: string) {
  issues.push({ path, message });
}

export type RecipeInput = Recipe;

export function safeValidateRecipe(input: unknown): SafeParseResult<RecipeInput> {
  const issues: Issue[] = [];

  if (!isObject(input)) {
    return { success: false, error: { issues: [{ path: [], message: 'recipe must be an object' }] } };
  }

  if (typeof input.id !== 'string' || input.id.length === 0) push(issues, ['id'], 'id is required');
  if (typeof input.title !== 'string' || input.title.length === 0) push(issues, ['title'], 'title is required');

  if (!Array.isArray(input.ingredients) || input.ingredients.length === 0) {
    push(issues, ['ingredients'], 'ingredients must be a non-empty array');
  }

  if (!Array.isArray(input.steps) || input.steps.length === 0) {
    push(issues, ['steps'], 'steps must be a non-empty array');
  }

  if (!isObject(input.metadata)) push(issues, ['metadata'], 'metadata must be an object');
  if (!isObject(input.source)) {
    push(issues, ['source'], 'source must be an object');
  } else {
    if (!['image', 'video', 'text'].includes(String(input.source.sourceType ?? ''))) {
      push(issues, ['source', 'sourceType'], 'sourceType must be image, video, or text');
    }
    if (typeof input.source.extractionConfidence !== 'number' || input.source.extractionConfidence < 0 || input.source.extractionConfidence > 1) {
      push(issues, ['source', 'extractionConfidence'], 'extractionConfidence must be between 0 and 1');
    }
    if (typeof input.source.parserVersion !== 'string' || input.source.parserVersion.length === 0) {
      push(issues, ['source', 'parserVersion'], 'parserVersion is required');
    }
  }

  if (!isIsoDate(input.createdAt)) push(issues, ['createdAt'], 'createdAt must be an ISO date string');
  if (!isIsoDate(input.updatedAt)) push(issues, ['updatedAt'], 'updatedAt must be an ISO date string');

  if (issues.length > 0) return { success: false, error: { issues } };
  return { success: true, data: input as RecipeInput };
}

export function validateRecipe(input: unknown): RecipeInput {
  const result = safeValidateRecipe(input);
  if (!result.success) {
    throw new Error(`Recipe validation failed: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
  }

  return result.data;
}
