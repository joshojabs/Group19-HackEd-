import { NextRequest, NextResponse } from "next/server"
import { buildSpoonacularParams } from "@/lib/spoonacular"

/**
 * GET /api/spoonacular/recipes?mealType=Lunch&glucose=6.5&ingredients=potato,onion,...
 *
 * Proxies the Spoonacular complexSearch endpoint.
 * Uses includeIngredients (not query) for ingredient-based search,
 * sort=max-used-ingredients for best matching, and automatic retry
 * without maxCarbs if 0 results on the first attempt.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const mealType = sp.get("mealType") ?? undefined
  const glucose = sp.get("glucose") ? Number(sp.get("glucose")) : undefined
  const query = sp.get("query") ?? undefined
  const ingredients = sp.get("ingredients")
    ? sp.get("ingredients")!.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined

  const diet = sp.get("diet") ?? undefined
  const intolerances = sp.get("intolerances") ?? undefined
  const excludeIngredients = sp.get("excludeIngredients") ?? undefined

  const apiKey = process.env.SPOONACULAR_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "SPOONACULAR_API_KEY is not configured.", results: [] },
      { status: 500 }
    )
  }

  const params = buildSpoonacularParams({
    mealType,
    glucoseValue: glucose,
    queryText: query,
    ingredients,
    diet,
    intolerances,
    excludeIngredients,
  })

  // Use max-used-ingredients sort so recipes using the scanned item rank higher
  params.sort = "max-used-ingredients"
  params.sortDirection = "desc"

  async function doSearch(searchParams: Record<string, string | number>) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      qs.set(k, String(v))
    }
    qs.set("apiKey", apiKey!)

    const url = `https://api.spoonacular.com/recipes/complexSearch?${qs.toString()}`
    const res = await fetch(url)

    if (res.status === 402) {
      return { error: "Spoonacular rate limit reached. Try again later.", results: [], status: 402 }
    }
    if (!res.ok) {
      console.error("[spoonacular] Upstream status:", res.status)
      return { error: "Spoonacular request failed.", results: [], status: res.status }
    }

    const data = await res.json()
    const results = (data.results ?? []).map(
      (r: Record<string, unknown>) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        readyInMinutes: r.readyInMinutes ?? undefined,
        servings: r.servings ?? undefined,
      })
    )
    return { results, error: null, status: 200 }
  }

  try {
    /* --- Attempt 1: full filters including maxCarbs --- */
    let result = await doSearch(params)

    /* --- Attempt 2: retry without maxCarbs if 0 results --- */
    if (result.results.length === 0 && !result.error && params.maxCarbs) {
      const relaxedParams = { ...params }
      delete relaxedParams.maxCarbs
      const retried = await doSearch(relaxedParams)
      if (retried.results.length > 0) {
        return NextResponse.json({
          results: retried.results,
          maxCarbs: params.maxCarbs ?? null,
          relaxed: true,
          relaxedMessage: "Could not find recipes within the carb target. Showing best matches instead.",
        })
      }
      result = retried
    }

    /* --- Attempt 3: fall back to query=productName with minimal filters --- */
    if (result.results.length === 0 && !result.error && query) {
      const fallbackParams: Record<string, string | number> = {
        query,
        number: 12,
        addRecipeInformation: "true",
        instructionsRequired: "true",
      }
      if (mealType) {
        const mapped: Record<string, string> = {
          breakfast: "breakfast", lunch: "main course",
          dinner: "main course", snack: "snack",
        }
        if (mapped[mealType.toLowerCase()]) fallbackParams.type = mapped[mealType.toLowerCase()]
      }
      const fallback = await doSearch(fallbackParams)
      if (fallback.results.length > 0) {
        return NextResponse.json({
          results: fallback.results,
          maxCarbs: params.maxCarbs ?? null,
          relaxed: true,
          relaxedMessage: "Could not find recipes using this item. Showing related recipes instead.",
        })
      }
    }

    return NextResponse.json({
      results: result.results,
      maxCarbs: params.maxCarbs ?? null,
      error: result.error ?? undefined,
    })
  } catch (err) {
    console.error("[spoonacular] Upstream error:", err)
    return NextResponse.json(
      { error: "Failed to reach Spoonacular.", results: [] },
      { status: 502 }
    )
  }
}
