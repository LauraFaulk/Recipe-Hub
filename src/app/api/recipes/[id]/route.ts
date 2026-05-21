import { getRecipe, updateRecipe } from '../../../../lib/storage/recipe-store.ts';
import {
  RecipeByIdResponseSchema,
  RecipeUpdateRequestSchema,
} from '../../../../lib/validation/api-schemas.ts';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const recipe = getRecipe(id);
  if (!recipe) {
    return Response.json({ code: 'not_found', message: 'recipe not found' }, { status: 404 });
  }

  const payload = RecipeByIdResponseSchema.parse({ recipe });
  return Response.json(payload, { status: 200 });
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const parsedBody = RecipeUpdateRequestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return Response.json({ code: 'bad_request', message: 'invalid recipe payload' }, { status: 400 });
  }

  if (parsedBody.data.recipe.id !== id) {
    return Response.json(
      { code: 'bad_request', message: 'recipe id in path and body must match' },
      { status: 400 },
    );
  }

  const updated = updateRecipe(id, parsedBody.data.recipe);
  if (!updated) {
    return Response.json({ code: 'not_found', message: 'recipe not found' }, { status: 404 });
  }

  const payload = RecipeByIdResponseSchema.parse({ recipe: updated });
  return Response.json(payload, { status: 200 });
}
