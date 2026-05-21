import { z } from 'zod';
import { RecipeSchema } from './recipe-schema.ts';

export const UploadResponseSchema = z.object({
  mediaId: z.string().min(1),
  sourceType: z.enum(['image', 'video', 'text']),
  storageUrl: z.string().min(1).refine((value) => value.startsWith('memory://') || value.startsWith('http://') || value.startsWith('https://'), {
    message: 'storageUrl must use memory://, http://, or https://',
  }),
  status: z.literal('uploaded'),
});

export const IngestRequestSchema = z.object({
  mediaId: z.string().min(1),
});

export const IngestResponseSchema = z.object({
  recipeId: z.string().min(1),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()),
  missingFields: z.array(z.string()),
  status: z.enum(['ready_for_review', 'failed']),
});

export const RecipeByIdResponseSchema = z.object({
  recipe: RecipeSchema,
});

export const RecipeUpdateRequestSchema = z.object({
  recipe: RecipeSchema,
});

export const ApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
});
