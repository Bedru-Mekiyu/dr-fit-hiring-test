const API_BASE = 'http://localhost:8080';

export type Recipe = {
  id: number;
  title: string;
  image: string | null;
  prep_time: number;
  ingredients: string[];
};

type RawIngredient = {
  name?: unknown;
  weight?: unknown;
  unit?: unknown;
};

type RawRecipe = {
  id?: unknown;
  title?: unknown;
  image?: unknown;
  prep_time?: unknown;
  ingredients?: unknown;
};

function formatIngredient(item: RawIngredient): string | null {
  if (typeof item.name !== 'string' || item.name.trim().length === 0) {
    return null;
  }

  const hasWeight = typeof item.weight === 'number' || typeof item.weight === 'string';
  const weight = hasWeight ? String(item.weight).trim() : '';
  const unit = typeof item.unit === 'string' ? item.unit.trim() : '';
  const amount = `${weight}${unit}`.trim();

  return amount ? `${item.name} - ${amount}` : item.name;
}

function normalizeIngredients(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => formatIngredient((item ?? {}) as RawIngredient))
      .filter((value): value is string => Boolean(value));
  }

  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  return [];
}

function normalizeRecipe(raw: RawRecipe): Recipe {
  return {
    id: typeof raw.id === 'number' ? raw.id : 0,
    title: typeof raw.title === 'string' ? raw.title : 'Untitled recipe',
    image: typeof raw.image === 'string' && raw.image.trim().length > 0 ? raw.image : null,
    prep_time: typeof raw.prep_time === 'number' ? raw.prep_time : 0,
    ingredients: normalizeIngredients(raw.ingredients),
  };
}

export async function fetchRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${API_BASE}/recipes`);
  if (!res.ok) throw new Error(`Failed to fetch recipes: ${res.status}`);
  const payload = (await res.json()) as unknown;
  if (!Array.isArray(payload)) return [];
  return payload
    .map((item) => normalizeRecipe((item ?? {}) as RawRecipe))
    .filter((recipe) => recipe.id > 0);
}

export async function fetchRecipe(id: number): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch recipe: ${res.status}`);
  return normalizeRecipe((await res.json()) as RawRecipe);
}
