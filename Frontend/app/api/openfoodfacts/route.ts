import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/openfoodfacts?barcode=XXXXXXXXXXXXX
 *
 * Proxies the Open Food Facts v2 API so the client never talks to OFF directly.
 * Returns a normalised ScannedProduct shape or { found: false }.
 */
export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get("barcode")

  if (!barcode || !/^\d{4,20}$/.test(barcode)) {
    return NextResponse.json(
      { error: "A valid numeric barcode is required." },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          "User-Agent": "Gluca - Web - MVP - https://example.com - scan",
        },
        next: { revalidate: 3600 }, // cache for 1 h
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { found: false, barcode },
        { status: 200 }
      )
    }

    const data = await res.json()

    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ found: false, barcode }, { status: 200 })
    }

    const p = data.product

    /* ---- Extract usable ingredient keywords ---- */
    let parsedIngredients: string[] = []

    // Prefer structured tags (e.g. ["en:potato","en:onion","en:wheat-flour"])
    if (Array.isArray(p.ingredients_tags) && p.ingredients_tags.length > 0) {
      parsedIngredients = p.ingredients_tags
        .map((t: string) => t.replace(/^[a-z]{2}:/, "").replace(/-/g, " ").trim())
        .filter((s: string) => s.length > 1 && s.length < 40)
        .slice(0, 7)
    }
    // Fallback: split ingredients_text by commas
    else if (typeof p.ingredients_text === "string" && p.ingredients_text.length > 0) {
      parsedIngredients = p.ingredients_text
        .split(",")
        .map((s: string) =>
          s
            .replace(/\(.*?\)/g, "")     // remove parenthetical info
            .replace(/\d+(\.\d+)?%?/g, "") // remove percentages
            .trim()
            .toLowerCase()
        )
        .filter((s: string) => s.length > 1 && s.length < 40)
        .slice(0, 7)
    }

    return NextResponse.json({
      found: true,
      product: {
        barcode,
        name: p.product_name ?? undefined,
        brand: p.brands ?? undefined,
        image: p.image_front_url ?? undefined,
        ingredientsText: p.ingredients_text ?? undefined,
        ingredientsTags: Array.isArray(p.ingredients_tags) ? p.ingredients_tags : undefined,
        parsedIngredients,
        nutriments: p.nutriments ?? undefined,
      },
    })
  } catch (err) {
    console.error("[openfoodfacts] Upstream error:", err)
    return NextResponse.json(
      { error: "Failed to reach Open Food Facts." },
      { status: 502 }
    )
  }
}
