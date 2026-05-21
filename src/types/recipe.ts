export type MediaType = 'image' | 'video' | 'text';

export interface Ingredient {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  preparation?: string;
  optional?: boolean;
  group?: string;
  notes?: string;
}

export interface InstructionStep {
  id: string;
  order: number;
  text: string;
  timerMinutes?: number;
}

export interface Nutrition {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export interface RecipeMetadata {
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface SourceInfo {
  sourceType: MediaType;
  originalFileName?: string;
  sourceUrl?: string;
  rawExtractedText?: string;
  extractionConfidence: number;
  parserVersion: string;
  parseWarnings?: string[];
  missingFields?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  steps: InstructionStep[];
  metadata: RecipeMetadata;
  nutrition?: Nutrition;
  source: SourceInfo;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeDraftInput {
  mediaId: string;
  mediaType: MediaType;
  userId?: string;
}

export interface RecipeExtractionResult {
  recipe: Recipe;
  warnings: string[];
  missingFields: string[];
}
