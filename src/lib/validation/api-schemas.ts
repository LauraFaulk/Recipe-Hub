import { safeValidateRecipe } from './recipe-schema.ts';
import type { ApiError, IngestRequest, IngestResponse, RecipeByIdResponse, RecipeUpdateRequest, UploadResponse } from '../../types/api.ts';

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

export const UploadResponseSchema = schema<UploadResponse>((input) => {
  if (!isObject(input)) return { ok: false as const, issues: [{ path: [], message: 'object required' }] };
  const { mediaId, sourceType, storageUrl, status } = input;
  const issues = [] as Array<{ path: Array<string | number>; message: string }>;
  if (typeof mediaId !== 'string' || mediaId.length === 0) issues.push({ path: ['mediaId'], message: 'required' });
  if (!['image', 'video', 'text'].includes(String(sourceType ?? ''))) issues.push({ path: ['sourceType'], message: 'invalid' });
  if (typeof storageUrl !== 'string' || !/^(memory|http|https):\/\//.test(storageUrl)) issues.push({ path: ['storageUrl'], message: 'invalid' });
  if (status !== 'uploaded') issues.push({ path: ['status'], message: 'invalid' });
  return issues.length ? { ok: false as const, issues } : { ok: true as const, value: { mediaId, sourceType, storageUrl, status: 'uploaded' as const } };
});

export const IngestRequestSchema = schema<IngestRequest>((input) => {
  if (!isObject(input) || typeof input.mediaId !== 'string' || input.mediaId.length === 0) {
    return { ok: false as const, issues: [{ path: ['mediaId'], message: 'required' }] };
  }
  return { ok: true as const, value: { mediaId: input.mediaId } };
});

export const IngestResponseSchema = schema<IngestResponse>((input) => {
  if (!isObject(input)) return { ok: false as const, issues: [{ path: [], message: 'object required' }] };

  const issues = [] as Array<{ path: Array<string | number>; message: string }>;
  const { recipeId, confidence, warnings, missingFields, status } = input;

  if (typeof recipeId !== 'string' || recipeId.length === 0) issues.push({ path: ['recipeId'], message: 'required' });
  if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) issues.push({ path: ['confidence'], message: 'must be between 0 and 1' });
  if (!Array.isArray(warnings) || warnings.some((warning) => typeof warning !== 'string')) issues.push({ path: ['warnings'], message: 'must be a string array' });
  if (!Array.isArray(missingFields) || missingFields.some((field) => typeof field !== 'string')) issues.push({ path: ['missingFields'], message: 'must be a string array' });
  if (status !== 'ready_for_review' && status !== 'failed') issues.push({ path: ['status'], message: 'invalid' });

  if (issues.length > 0) return { ok: false as const, issues };

  return {
    ok: true as const,
    value: {
      recipeId,
      confidence,
      warnings,
      missingFields,
      status,
    },
  };
});

export const RecipeByIdResponseSchema = schema<RecipeByIdResponse>((input) => {
  if (!isObject(input)) return { ok: false as const, issues: [{ path: [], message: 'object required' }] };
  const checked = safeValidateRecipe(input.recipe);
  if (!checked.success) return { ok: false as const, issues: checked.error.issues.map((i) => ({ path: ['recipe', ...i.path], message: i.message })) };
  return { ok: true as const, value: { recipe: checked.data } };
});

export const RecipeUpdateRequestSchema: Parseable<RecipeUpdateRequest> = RecipeByIdResponseSchema;

export const ApiErrorSchema = schema<ApiError>((input) => {
  if (!isObject(input)) return { ok: false as const, issues: [{ path: [], message: 'object required' }] };
  const issues = [] as Array<{ path: Array<string | number>; message: string }>;
  if (typeof input.code !== 'string' || input.code.length === 0) issues.push({ path: ['code'], message: 'required' });
  if (typeof input.message !== 'string' || input.message.length === 0) issues.push({ path: ['message'], message: 'required' });
  if (input.details !== undefined && !isObject(input.details)) issues.push({ path: ['details'], message: 'must be an object when provided' });

  if (issues.length > 0) return { ok: false as const, issues };
  return {
    ok: true as const,
    value: {
      code: input.code,
      message: input.message,
      details: input.details as Record<string, unknown> | undefined,
    },
  };
});
