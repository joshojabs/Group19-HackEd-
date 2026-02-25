import { NextRequest, NextResponse } from "next/server"
import type { FullRecipe, RecipeIngredient, RecipeStep } from "@/lib/types"

/**
 * GET /api/spoonacular/recipe?id=123
 *
 * Fetches full recipe information + nutrition from Spoonacular,
 * keeping the API key server-side.
 */
export async function GET(req: NextRequest) {
  const recipeId = req.nextUrl.searchParams.get("id")

  /* Validate: must be present and numeric */
  if (!recipeId || !/^\d+$/.test(recipeId)) {
    return NextResponse.json(
      { error: "A valid numeric recipe ID is required." },
      { status: 400 }
    )
  }

  const apiKey = process.env.SPOONACULAR_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "SPOONACULAR_API_KEY is not configured." },
      { status: 500 }
    )
  }

  try {
    /* 1) Recipe information with nutrition */
    const infoUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${apiKey}`
    const infoRes = await fetch(infoUrl)

    if (infoRes.status === 402) {
      return NextResponse.json(
        { error: "Spoonacular rate limit reached." },
        { status: 429 }
      )
    }
    if (infoRes.status === 404) {
      return NextResponse.json(
        { error: "Recipe details unavailable. This recipe may have been removed." },
        { status: 404 }
      )
    }
    if (!infoRes.ok) {
      return NextResponse.json(
        { error: `Spoonacular returned status ${infoRes.status}.` },
        { status: 502 }
      )
    }

    const info = await infoRes.json()

    /* Parse ingredients */
    const ingredients: RecipeIngredient[] = (
      info.extendedIngredients ?? []
    ).map((i: Record<string, unknown>) => ({
      name: i.name ?? i.originalName ?? "",
      amount: i.amount ?? 0,
      unit: i.unit ?? "",
    }))

    /* Parse steps */
    let steps: RecipeStep[] = []
    const instructions = info.analyzedInstructions
    if (Array.isArray(instructions) && instructions.length > 0) {
      steps = ((instructions[0] as Record<string, unknown>).steps as Array<Record<string, unknown>> ?? []).map(
        (s) => ({
          number: (s.number as number) ?? 0,
          step: (s.step as string) ?? "",
        })
      )
    }
    /* Fallback: use the raw instructions string split by sentences */
    if (steps.length === 0 && typeof info.instructions === "string") {
      const raw = info.instructions.replace(/<[^>]*>/g, "")
      steps = raw
        .split(/(?<=\.)\s+/)
        .filter((s: string) => s.trim().length > 0)
        .map((s: string, i: number) => ({ number: i + 1, step: s.trim() }))
    }

    /* Parse nutrition from the nested nutrients array */
    const nutrientsList: Array<{ name: string; amount: number; unit: string }> =
      info.nutrition?.nutrients ?? []

    function findNutrient(name: string): number | undefined {
      const n = nutrientsList.find(
        (x) => x.name.toLowerCase() === name.toLowerCase()
      )
      return n ? Math.round(n.amount) : undefined
    }

    let nutrition: FullRecipe["nutrition"] = {
      calories: findNutrient("Calories"),
      carbs: findNutrient("Carbohydrates"),
      protein: findNutrient("Protein"),
      fat: findNutrient("Fat"),
      fiber: findNutrient("Fiber"),
      sugar: findNutrient("Sugar"),
    }

    /* 2) Fallback: fetch nutritionWidget.json if carbs missing */
    if (nutrition.carbs == null) {
      try {
        const widgetUrl = `https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?apiKey=${apiKey}`
        const widgetRes = await fetch(widgetUrl)
        if (widgetRes.ok) {
          const w = await widgetRes.json()
          const parseNum = (v: unknown) => {
            if (typeof v === "number") return Math.round(v)
            if (typeof v === "string") return Math.round(parseFloat(v)) || undefined
            return undefined
          }
          nutrition = {
            calories: nutrition.calories ?? parseNum(w.calories),
            carbs: nutrition.carbs ?? parseNum(w.carbs),
            protein: nutrition.protein ?? parseNum(w.protein),
            fat: nutrition.fat ?? parseNum(w.fat),
            fiber: nutrition.fiber,
            sugar: nutrition.sugar,
          }
        }
      } catch {
        /* swallow – nutrition is best-effort */
      }
    }

    /* Strip HTML from summary */
    const summary =
      typeof info.summary === "string"
        ? info.summary.replace(/<[^>]*>/g, "").slice(0, 500)
        : ""

    const result: FullRecipe = {
      id: info.id,
      title: info.title ?? "Untitled",
      image: info.image ?? "",
      readyInMinutes: info.readyInMinutes ?? 0,
      servings: info.servings ?? 0,
      summary,
      ingredients,
      steps,
      nutrition,
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    })
  } catch (err) {
    console.error("[spoonacular/recipe] error:", err)
    return NextResponse.json({ error: "Failed to fetch recipe." }, { status: 502 })
  }
}
