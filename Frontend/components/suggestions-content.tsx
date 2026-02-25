"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Flame, AlertTriangle, Info } from "lucide-react"
import { useGlucaStore } from "@/lib/store"
import { getMaxCarbs, getGlucoseLabel, mergeIngredients } from "@/lib/spoonacular"
import { usePreferences } from "@/lib/usePreferences"
import { fetchRecipes } from "@/lib/api"
import type { RecipeResult } from "@/lib/types"
import type { Recipe } from "@/lib/mockData"
import { Skeleton } from "@/components/ui/skeleton"

export function SuggestionsContent({ mealType }: { mealType: string }) {
  const glucose = useGlucaStore((s) => s.glucose)
  const scannedProduct = useGlucaStore((s) => s.scannedProduct)
  const selectedIngredients = useGlucaStore((s) => s.selectedIngredients)
  const { preferences } = usePreferences()

  const [apiRecipes, setApiRecipes] = useState<RecipeResult[]>([])
  const [apiMaxCarbs, setApiMaxCarbs] = useState<number | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(true)

  const [fallbackRecipes, setFallbackRecipes] = useState<Recipe[]>([])
  const [fallbackLoading, setFallbackLoading] = useState(true)
  const [relaxedMessage, setRelaxedMessage] = useState<string | null>(null)

  useEffect(() => {
    const qs = new URLSearchParams()
    qs.set("mealType", mealType)
    qs.set("glucose", String(glucose.value))

    // Merge scanned product ingredients + selected checklist items + kitchen staples
    const scannedIngs = scannedProduct?.parsedIngredients ?? []
    const merged = mergeIngredients(scannedIngs, selectedIngredients, true)
    if (merged.length > 0) {
      qs.set("ingredients", merged.join(","))
    }

    // Pass product name as query for fallback text matching
    if (scannedProduct?.name) qs.set("query", scannedProduct.name)

    /* Dietary preferences */
    if (preferences.diet) qs.set("diet", preferences.diet)
    if (preferences.intolerances.length > 0)
      qs.set("intolerances", preferences.intolerances.join(","))
    if (preferences.excludeIngredients.length > 0)
      qs.set("excludeIngredients", preferences.excludeIngredients.join(","))

    setApiLoading(true)
    setRelaxedMessage(null)
    fetch(`/api/spoonacular/recipes?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error && (!data.results || data.results.length === 0)) {
          setApiError(data.error)
        } else {
          setApiRecipes(data.results ?? [])
          setApiMaxCarbs(data.maxCarbs ?? null)
          if (data.error) setApiError(data.error)
          if (data.relaxedMessage) setRelaxedMessage(data.relaxedMessage)
        }
      })
      .catch(() => setApiError("Could not reach recipe service."))
      .finally(() => setApiLoading(false))

    fetchRecipes(mealType)
      .then(setFallbackRecipes)
      .finally(() => setFallbackLoading(false))
  }, [mealType, glucose.value, scannedProduct, selectedIngredients, preferences])

  const loading = apiLoading && fallbackLoading
  const maxCarbs = apiMaxCarbs ?? getMaxCarbs(glucose.value)
  const glucoseLabel = getGlucoseLabel(glucose.value)

  const hasApiResults = apiRecipes.length > 0
  const featured = hasApiResults ? apiRecipes[0] : undefined
  const others = hasApiResults ? apiRecipes.slice(1) : []

  const fallbackFeatured =
    fallbackRecipes.find((r) => r.featured) ?? fallbackRecipes[0]
  const fallbackOthers = fallbackRecipes.filter(
    (r) => r.id !== fallbackFeatured?.id
  )

  const hasDietaryFilters =
    !!preferences.diet ||
    preferences.intolerances.length > 0 ||
    preferences.excludeIngredients.length > 0

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="w-full aspect-video rounded-2xl mb-6" />
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <Skeleton className="aspect-[4/3] rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex-1 lg:max-w-2xl">
        {/* Glucose + carb badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-[#F0F9D3] text-[#1A5142] text-xs font-semibold px-3 py-1.5 rounded-full">
            <Flame className="h-3.5 w-3.5" />
            Max carbs: {maxCarbs}g
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[#F0F9D3] text-[#1A5142] text-xs font-semibold px-3 py-1.5 rounded-full">
            Glucose: {glucose.value.toFixed(1)} mmol/L ({glucoseLabel})
          </span>
          {scannedProduct?.name && (
            <span className="inline-flex items-center gap-1.5 bg-[#00A375]/10 text-[#007051] text-xs font-semibold px-3 py-1.5 rounded-full">
              Scanned: {scannedProduct.name}
            </span>
          )}
        </div>

        {/* Dietary preference chips */}
        {hasDietaryFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {preferences.diet && (
              <span className="inline-flex items-center gap-1 bg-[#007051] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Diet: {preferences.diet.charAt(0).toUpperCase() + preferences.diet.slice(1)}
              </span>
            )}
            {preferences.intolerances.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-[#007051] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Intolerances: {preferences.intolerances.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}
              </span>
            )}
            {preferences.excludeIngredients.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-[#007051] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Excluded: {preferences.excludeIngredients.join(", ")}
              </span>
            )}
          </div>
        )}

        {/* Allergen disclaimer */}
        {hasDietaryFilters && (
          <div className="flex items-start gap-2 bg-[#F0F9D3] rounded-xl p-3 mb-4 text-xs text-[#1A5142]">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Always check ingredients for allergens.</span>
          </div>
        )}

        <h2 className="text-lg font-semibold text-[#0B2027] mb-1">
          Your suggested recipe
        </h2>
        <p className="text-xs text-[#1A5142] mb-4">
          This is based on your current glucose level
        </p>

        {/* Relaxed search notice */}
        {relaxedMessage && !apiError && (
          <div className="flex items-start gap-2 bg-[#F0F9D3] border border-[#d4e5c9] rounded-xl p-3 mb-4 text-sm text-[#1A5142]">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{relaxedMessage}</span>
          </div>
        )}

        {/* API error notice */}
        {apiError && (
          <div className="flex items-start gap-2 bg-[#FED359]/20 border border-[#FED359] rounded-xl p-3 mb-4 text-sm text-[#0B2027]">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#8D7338]" />
            <span>{apiError} Showing local suggestions below.</span>
          </div>
        )}

        {/* ---------- Spoonacular results ---------- */}
        {hasApiResults && featured && (
          <>
            <Link
              href={`/recipe/${featured.id}`}
              className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 600px"
                  priority
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#0B2027]">
                  {featured.title}
                </h3>
                {featured.readyInMinutes && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-[#1A5142]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{featured.readyInMinutes} min</span>
                  </div>
                )}
              </div>
            </Link>

            {others.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-[#0B2027] mb-3">
                  Other recipe suggestions
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
                  {others.map((r) => (
                    <Link
                      key={r.id}
                      href={`/recipe/${r.id}`}
                      className="min-w-[140px] lg:min-w-0 group block"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                        <Image
                          src={r.image}
                          alt={r.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 33vw, 200px"
                        />
                      </div>
                      <p className="text-xs text-[#00A375] font-medium mt-1.5 truncate">
                        {r.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ---------- Local fallback results ---------- */}
        {!hasApiResults && fallbackFeatured && (
          <>
            <Link
              href={`/recipe/${fallbackFeatured.id}`}
              className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={fallbackFeatured.image}
                  alt={fallbackFeatured.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 600px"
                  priority
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#0B2027]">
                  {fallbackFeatured.title}
                </h3>
                <p className="text-sm text-[#1A5142] mt-1 leading-relaxed">
                  {fallbackFeatured.description}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-[#1A5142]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{fallbackFeatured.time}</span>
                </div>
              </div>
            </Link>

            {fallbackOthers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-[#0B2027] mb-3">
                  Other recipe suggestions
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
                  {fallbackOthers.map((recipe) => (
                    <Link
                      key={recipe.id}
                      href={`/recipe/${recipe.id}`}
                      className="min-w-[140px] lg:min-w-0 group block"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                        <Image
                          src={recipe.image}
                          alt={recipe.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 33vw, 200px"
                        />
                      </div>
                      <p className="text-xs text-[#00A375] font-medium mt-1.5 truncate">
                        {recipe.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!hasApiResults && !fallbackFeatured && (
          <p className="text-[#1A5142]">No recipes found for this meal type.</p>
        )}
      </div>
    </div>
  )
}
