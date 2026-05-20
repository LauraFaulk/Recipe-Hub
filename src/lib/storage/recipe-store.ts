import type { Recipe } from '../../types/recipe';

const recipes = new Map<string, Recipe>();

export function putRecipe(recipe: Recipe): Recipe {
  recipes.set(recipe.id, recipe);
  return recipe;
}

export function getRecipe(recipeId: string): Recipe | undefined {
  return recipes.get(recipeId);
}

export function updateRecipe(recipeId: string, recipe: Recipe): Recipe | undefined {
  if (!recipes.has(recipeId)) {
    return undefined;
  }

  recipes.set(recipeId, recipe);
  return recipe;
}
