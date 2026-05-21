import { z } from 'zod';

export const IngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  amount: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
  preparation: z.string().min(1).optional(),
  optional: z.boolean().optional(),
  group: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

export const InstructionStepSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  text: z.string().min(1),
  timerMinutes: z.number().int().nonnegative().optional(),
});

export const NutritionSchema = z
  .object({
    calories: z.number().nonnegative().optional(),
    proteinG: z.number().nonnegative().optional(),
    carbsG: z.number().nonnegative().optional(),
    fatG: z.number().nonnegative().optional(),
  })
  .optional();

export const RecipeMetadataSchema = z.object({
  servings: z.number().int().positive().optional(),
  prepTimeMinutes: z.number().int().nonnegative().optional(),
  cookTimeMinutes: z.number().int().nonnegative().optional(),
  totalTimeMinutes: z.number().int().nonnegative().optional(),
  cuisine: z.string().min(1).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export const SourceInfoSchema = z.object({
  sourceType: z.enum(['image', 'video', 'text']),
  originalFileName: z.string().min(1).optional(),
  sourceUrl: z.string().url().optional(),
  rawExtractedText: z.string().min(1).optional(),
  extractionConfidence: z.number().min(0).max(1),
  parserVersion: z.string().min(1),
  parseWarnings: z.array(z.string().min(1)).optional(),
  missingFields: z.array(z.string().min(1)).optional(),
});

export const RecipeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  ingredients: z.array(IngredientSchema).min(1),
  steps: z.array(InstructionStepSchema).min(1),
  metadata: RecipeMetadataSchema,
  nutrition: NutritionSchema,
  source: SourceInfoSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type RecipeInput = z.infer<typeof RecipeSchema>;

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
