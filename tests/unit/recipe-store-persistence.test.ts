import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { putRecipe } from '../../src/lib/storage/recipe-store.ts';

test('recipe store persists recipes to disk file', () => {
  const now = new Date().toISOString();
  const recipeId = `rcp_disk_${Date.now()}`;

  putRecipe({
    id: recipeId,
    title: 'Disk Recipe',
    ingredients: [{ id: 'ing_1', name: 'Salt' }],
    steps: [{ id: 'step_1', order: 1, text: 'Stir.' }],
    metadata: {},
    source: { sourceType: 'text', extractionConfidence: 1, parserVersion: 'test' },
    createdAt: now,
    updatedAt: now,
  });

  const diskPath = path.join(process.cwd(), '.data', 'recipes.json');
  assert.equal(fs.existsSync(diskPath), true);

  const raw = fs.readFileSync(diskPath, 'utf8');
  assert.equal(raw.includes(recipeId), true);
});
