import { getRecipe } from '../../../../../lib/storage/recipe-store.ts';

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildRecipeHtml(recipe: ReturnType<typeof getRecipe>): string {
  if (!recipe) {
    return '<!doctype html><html><body><h1>Recipe not found</h1></body></html>';
  }

  const ingredients = recipe.ingredients
    .map((ingredient) => `<li>${escapeHtml(`${ingredient.amount ?? ''} ${ingredient.unit ?? ''} ${ingredient.name}`.trim())}</li>`)
    .join('');

  const steps = recipe.steps
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((step) => `<li>${escapeHtml(step.text)}</li>`)
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(recipe.title)}</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; margin: 2rem; color: #1f2430; }
      h1, h2 { margin-bottom: 0.5rem; }
      .meta { color: #4b5568; margin-bottom: 1rem; }
      ul, ol { padding-left: 1.25rem; }
      li { margin-bottom: 0.35rem; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(recipe.title)}</h1>
    <p class="meta">Servings: ${recipe.metadata.servings ?? '-'} · Prep: ${recipe.metadata.prepTimeMinutes ?? '-'} min · Cook: ${recipe.metadata.cookTimeMinutes ?? '-'} min · Total: ${recipe.metadata.totalTimeMinutes ?? '-'} min</p>
    <h2>Ingredients</h2>
    <ul>${ingredients}</ul>
    <h2>Directions</h2>
    <ol>${steps}</ol>
  </body>
</html>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const recipe = getRecipe(id);

  if (!recipe) {
    return Response.json({ code: 'not_found', message: 'recipe not found' }, { status: 404 });
  }

  const html = buildRecipeHtml(recipe);
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-disposition': `attachment; filename="${recipe.id}.html"`,
    },
  });
}
