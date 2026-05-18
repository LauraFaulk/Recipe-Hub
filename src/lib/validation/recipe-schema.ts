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

export function validateRecipe(input: unknown): RecipeInput {
  return RecipeSchema.parse(input);
}

export function safeValidateRecipe(input: unknown) {
  return RecipeSchema.safeParse(input);
}
