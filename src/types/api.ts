import type { MediaType, Recipe } from './recipe';

export interface UploadResponse {
  mediaId: string;
  sourceType: MediaType;
  storageUrl: string;
  status: 'uploaded';
}

export interface IngestRequest {
  mediaId: string;
}

export interface IngestResponse {
  recipeId: string;
  confidence: number;
  warnings: string[];
  missingFields: string[];
  status: 'ready_for_review' | 'failed';
}

export interface RecipeByIdResponse {
  recipe: Recipe;
}

export interface RecipeUpdateRequest {
  recipe: Recipe;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
