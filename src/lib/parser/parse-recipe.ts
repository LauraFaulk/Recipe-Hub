export async function parseRecipeFromText(
  rawText: string,
  mediaId: string,
  sourceType: 'image' | 'video' | 'text',
): Promise<unknown> {
  const now = new Date().toISOString();
  return {
    id: `rcp_${mediaId}`,
    title: 'Imported Recipe',
    ingredients: [{ id: 'ing_1', name: 'Ingredient from source text' }],
    steps: [{ id: 'step_1', order: 1, text: rawText.slice(0, 120) || 'Review source text.' }],
    metadata: {},
    source: {
      sourceType,
      extractionConfidence: 0.5,
      parserVersion: 'v0',
      rawExtractedText: rawText,
    },
    createdAt: now,
    updatedAt: now,
  };
}
