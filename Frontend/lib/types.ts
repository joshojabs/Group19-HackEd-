/* Shared data-model types used across the Gluca app */

export interface GlucoseReading {
  value: number
  unit: "mmol/L"
  recordedAt: string
}

export interface ScannedProduct {
  barcode: string
  name?: string
  brand?: string
  image?: string
  ingredientsText?: string
  ingredientsTags?: string[]
  parsedIngredients?: string[]
  nutriments?: Record<string, number | string>
}

export interface RecipeResult {
  id: number
  title: string
  image: string
  readyInMinutes?: number
  servings?: number
}

export type DietType =
  | "vegetarian"
  | "vegan"
  | "pescetarian"
  | "gluten free"
  | "ketogenic"
  | "paleo"

export interface DietaryPreferences {
  diet?: DietType
  intolerances: string[]
  excludeIngredients: string[]
}

export interface RecipeNutrient {
  name: string
  amount: number
  unit: string
}

export interface RecipeIngredient {
  name: string
  amount: number
  unit: string
}

export interface RecipeStep {
  number: number
  step: string
}

export interface FullRecipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  summary: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  nutrition: {
    calories?: number
    carbs?: number
    protein?: number
    fat?: number
    fiber?: number
    sugar?: number
  }
}
