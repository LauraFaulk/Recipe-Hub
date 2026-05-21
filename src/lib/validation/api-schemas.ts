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

type Parseable<T> = {
  parse(input: unknown): T;
  safeParse(input: unknown): { success: true; data: T } | { success: false; error: { issues: Array<{ path: Array<string | number>; message: string }> } };
};

function schema<T>(validator: (input: unknown) => { ok: true; value: T } | { ok: false; issues: Array<{ path: Array<string | number>; message: string }> }): Parseable<T> {
  return {
    parse(input: unknown): T {
      const result = validator(input);
      if (!result.ok) throw new Error(`Validation failed: ${result.issues.map((issue) => issue.path.join('.')).join(', ')}`);
      return result.value;
    },
    safeParse(input: unknown) {
      const result = validator(input);
      return result.ok ? { success: true as const, data: result.value } : { success: false as const, error: { issues: result.issues } };
    },
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export const UploadResponseSchema = schema((input) => {
  if (!isObject(input)) return { ok: false as const, issues: [{ path: [], message: 'object required' }] };
  const { mediaId, sourceType, storageUrl, status } = input;
  const issues = [] as Array<{ path: Array<string | number>; message: string }>;
  if (typeof mediaId !== 'string' || mediaId.length === 0) issues.push({ path: ['mediaId'], message: 'required' });
  if (!['image', 'video', 'text'].includes(String(sourceType ?? ''))) issues.push({ path: ['sourceType'], message: 'invalid' });
  if (typeof storageUrl !== 'string' || !/^(memory|http|https):\/\//.test(storageUrl)) issues.push({ path: ['storageUrl'], message: 'invalid' });
  if (status !== 'uploaded') issues.push({ path: ['status'], message: 'invalid' });
  return issues.length ? { ok: false as const, issues } : { ok: true as const, value: { mediaId, sourceType, storageUrl, status: 'uploaded' as const } };
});

export const IngestRequestSchema = schema((input) => {
  if (!isObject(input) || typeof input.mediaId !== 'string' || input.mediaId.length === 0) {
    return { ok: false as const, issues: [{ path: ['mediaId'], message: 'required' }] };
  }
  return { ok: true as const, value: { mediaId: input.mediaId } };
});

export const IngestResponseSchema = schema((input) => {
  if (!isObject(input)) return { ok: false as const, issues: [{ path: [], message: 'object required' }] };
  return { ok: true as const, value: input as { recipeId: string; confidence: number; warnings: string[]; missingFields: string[]; status: 'ready_for_review' | 'failed' } };
});

export const RecipeByIdResponseSchema = schema((input) => {
  if (!isObject(input)) return { ok: false as const, issues: [{ path: [], message: 'object required' }] };
  const checked = safeValidateRecipe(input.recipe);
  if (!checked.success) return { ok: false as const, issues: checked.error.issues.map((i) => ({ path: ['recipe', ...i.path], message: i.message })) };
  return { ok: true as const, value: { recipe: checked.data } };
});

export const RecipeUpdateRequestSchema = RecipeByIdResponseSchema;

export const ApiErrorSchema = schema((input) => ({ ok: true as const, value: input as { code: string; message: string; details?: Record<string, unknown> } }));
