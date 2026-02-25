/**
 * Glucose-aware Spoonacular query-parameter builder.
 *
 * Rules (mmol/L):
 *   >= 8.0  (high)     → maxCarbs = 35
 *   4.0–7.9 (in range) → maxCarbs = 55
 *   <= 4.0  (low)      → maxCarbs = 80
 */

const HIGH_THRESHOLD = 8.0
const LOW_THRESHOLD = 4.0

const MAX_CARBS_HIGH = 35
const MAX_CARBS_RANGE = 55
const MAX_CARBS_LOW = 80

export const COMMON_KITCHEN_INGREDIENTS = [
  "onion",
  "garlic",
  "potato",
  "carrot",
  "olive oil",
  "salt",
  "black pepper",
  "rice",
  "pasta",
  "egg",
]

/**
 * Merge scanned product ingredients + selected checklist ingredients
 * + common kitchen staples, deduplicating by lowercase match.
 */
export function mergeIngredients(
  scannedIngredients: string[],
  selectedIngredients: string[],
  includeKitchenStaples = true
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  const add = (items: string[]) => {
    for (const item of items) {
      const key = item.toLowerCase().trim()
      if (key && !seen.has(key)) {
        seen.add(key)
        result.push(key)
      }
    }
  }

  add(scannedIngredients)
  add(selectedIngredients)
  if (includeKitchenStaples) add(COMMON_KITCHEN_INGREDIENTS)

  return result
}

const MEAL_TYPE_MAP: Record<string, string> = {
  breakfast: "breakfast",
  lunch: "main course",
  dinner: "main course",
  snack: "snack",
}

export function getMaxCarbs(glucoseValue: number): number {
  if (glucoseValue >= HIGH_THRESHOLD) return MAX_CARBS_HIGH
  if (glucoseValue <= LOW_THRESHOLD) return MAX_CARBS_LOW
  return MAX_CARBS_RANGE
}

export function getGlucoseLabel(glucoseValue: number): string {
  if (glucoseValue >= HIGH_THRESHOLD) return "High"
  if (glucoseValue <= LOW_THRESHOLD) return "Low"
  return "In Range"
}

export interface SpoonacularQueryParams {
  mealType?: string
  glucoseValue?: number
  ingredients?: string[]
  queryText?: string
  diet?: string
  intolerances?: string
  excludeIngredients?: string
}

export function buildSpoonacularParams(
  params: SpoonacularQueryParams
): Record<string, string | number> {
  const result: Record<string, string | number> = {
    number: 12,
    addRecipeInformation: "true",
    instructionsRequired: "true",
  }

  if (params.queryText) {
    result.query = params.queryText
  }

  if (params.ingredients && params.ingredients.length > 0) {
    result.includeIngredients = params.ingredients.join(",")
  }

  if (params.mealType) {
    const mapped = MEAL_TYPE_MAP[params.mealType.toLowerCase()]
    if (mapped) result.type = mapped
  }

  if (params.glucoseValue != null) {
    result.maxCarbs = getMaxCarbs(params.glucoseValue)
  }

  if (params.diet) {
    result.diet = params.diet
  }

  if (params.intolerances) {
    result.intolerances = params.intolerances
  }

  if (params.excludeIngredients) {
    result.excludeIngredients = params.excludeIngredients
  }

  return result
}
