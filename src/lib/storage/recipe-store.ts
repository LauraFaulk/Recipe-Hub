import fs from 'node:fs';
import path from 'node:path';

import type { Recipe } from '../../types/recipe';

const recipes = new Map<string, Recipe>();
const dataDir = path.join(process.cwd(), '.data');
const recipesFilePath = path.join(dataDir, 'recipes.json');

function seedRecipes() {
  if (recipes.size > 0) {
    return;
  }

  const now = new Date().toISOString();
  const seededRecipe: Recipe = {
    id: 'cowboy-butter-chicken-shells',
    title: 'Cowboy Butter Chicken Shells in Three Cheese Sauce',
    ingredients: [
      { id: 'ing_1', name: 'Shell pasta', amount: 18, unit: 'oz' },
      { id: 'ing_2', name: 'Olive oil', amount: 1.5, unit: 'tablespoons' },
      { id: 'ing_3', name: 'Butter', amount: 3, unit: 'tablespoons' },
      { id: 'ing_4', name: 'Chicken breast, cut into bite-size pieces', amount: 1.5, unit: 'lbs' },
      { id: 'ing_5', name: 'Smoked paprika', amount: 1.5, unit: 'teaspoons' },
      { id: 'ing_6', name: 'Chili flakes', amount: 0.75, unit: 'teaspoon' },
      { id: 'ing_7', name: 'Garlic powder', amount: 0.75, unit: 'teaspoon' },
      { id: 'ing_8', name: 'Onion powder', amount: 0.75, unit: 'teaspoon' },
      { id: 'ing_9', name: 'Salt', amount: 0.75, unit: 'teaspoon' },
      { id: 'ing_10', name: 'Black pepper', amount: 0.75, unit: 'teaspoon' },
      { id: 'ing_11', name: 'Garlic, minced', amount: 6, unit: 'cloves' },
      { id: 'ing_12', name: 'Heavy cream', amount: 1.5, unit: 'cups' },
      { id: 'ing_13', name: 'Velveeta, cubed', amount: 9, unit: 'oz' },
      { id: 'ing_14', name: 'Shredded mozzarella', amount: 1.5, unit: 'cups' },
      { id: 'ing_15', name: 'Shredded cheddar', amount: 0.75, unit: 'cup' },
      { id: 'ing_16', name: 'Grated Parmesan', amount: 0.75, unit: 'cup' },
      { id: 'ing_17', name: 'Cream cheese, softened', amount: 6, unit: 'oz' },
      { id: 'ing_18', name: 'Italian seasoning', amount: 0.75, unit: 'teaspoon' },
      { id: 'ing_19', name: 'Reserved pasta water', amount: 0.75, unit: 'cup' },
    ],
    steps: [
      { id: 'step_1', order: 1, text: 'Cook the shell pasta in salted boiling water until tender. Save some pasta water, then drain and set aside.' },
      { id: 'step_2', order: 2, text: 'Heat olive oil in a large skillet over medium-high heat. Add the chicken and let it sear for a few minutes without moving so it gets a golden crust.' },
      { id: 'step_3', order: 3, text: 'Season with smoked paprika, chili flakes, garlic powder, onion powder, salt, and black pepper. Stir and cook until fully done.' },
      { id: 'step_4', order: 4, text: 'Add butter and let it melt into the chicken, then stir in the garlic and cook briefly until fragrant.' },
      { id: 'step_5', order: 5, text: 'Pour in the heavy cream and let it warm through. Add Velveeta and cream cheese, stirring until smooth.' },
      { id: 'step_6', order: 6, text: 'Mix in mozzarella, cheddar, and Parmesan until the sauce turns thick and creamy.' },
      { id: 'step_7', order: 7, text: 'Add Italian seasoning and a splash of pasta water to loosen the sauce slightly.' },
      { id: 'step_8', order: 8, text: 'Toss in the cooked shells and mix until fully coated.' },
      { id: 'step_9', order: 9, text: 'Plate the pasta and top with the chicken, finishing with extra sauce over the top.' },
    ],
    metadata: {
      servings: 6,
      prepTimeMinutes: 15,
      cookTimeMinutes: 25,
      totalTimeMinutes: 40,
    },
    source: {
      sourceType: 'text',
      extractionConfidence: 1,
      parserVersion: 'seed-v1',
      rawExtractedText: 'Manually seeded starter recipe',
    },
    createdAt: now,
    updatedAt: now,
  };

  recipes.set(seededRecipe.id, seededRecipe);
}

function loadRecipesFromDisk() {
  try {
    if (!fs.existsSync(recipesFilePath)) {
      return;
    }

    const raw = fs.readFileSync(recipesFilePath, 'utf8');
    const parsed = JSON.parse(raw) as Recipe[];
    for (const recipe of parsed) {
      recipes.set(recipe.id, recipe);
    }
  } catch {
    // Ignore malformed/missing disk data and continue with in-memory map.
  }
}

function persistRecipesToDisk() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    const payload = JSON.stringify(Array.from(recipes.values()), null, 2);
    fs.writeFileSync(recipesFilePath, payload, 'utf8');
  } catch {
    // Keep API non-fatal if disk persistence fails in constrained environments.
  }
}

loadRecipesFromDisk();
seedRecipes();
persistRecipesToDisk();

export function putRecipe(recipe: Recipe): Recipe {
  recipes.set(recipe.id, recipe);
  persistRecipesToDisk();
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
  persistRecipesToDisk();
  return recipe;
}
