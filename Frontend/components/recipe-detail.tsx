"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Clock, Users, AlertTriangle } from "lucide-react"
import { fetchRecipe } from "@/lib/api"
import type { Recipe } from "@/lib/mockData"
import type { FullRecipe } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * RecipeDetail now accepts either a Spoonacular numeric id or a local mock id.
 * It first tries the Spoonacular proxy; if the id is not numeric or the
 * API fails it falls back to the local mock data.
 */
export function RecipeDetail({ id }: { id: string }) {
  const [spoonRecipe, setSpoonRecipe] = useState<FullRecipe | null>(null)
  const [localRecipe, setLocalRecipe] = useState<Recipe | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const isNumeric = /^\d+$/.test(id)

    async function load() {
      /* Try Spoonacular first for numeric ids */
      if (isNumeric) {
        try {
          const res = await fetch(`/api/spoonacular/recipe?id=${id}`)
          if (res.ok) {
            const data: FullRecipe = await res.json()
            if (!cancelled) {
              setSpoonRecipe(data)
              setLoading(false)
              return
            }
          } else {
            const body = await res.json().catch(() => null)
            if (!cancelled) setError(body?.error ?? "Recipe API error.")
          }
        } catch {
          if (!cancelled) setError("Could not reach recipe service.")
        }
      }

      /* Fallback to local mock */
      const local = await fetchRecipe(id)
      if (!cancelled) {
        setLocalRecipe(local)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-2xl">
        <Skeleton className="w-full aspect-video rounded-2xl mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/3 mb-6" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-6 w-32 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  /* ---------- Spoonacular recipe ---------- */
  if (spoonRecipe) {
    const n = spoonRecipe.nutrition
    return (
      <div className="p-4 lg:p-8 max-w-2xl">
        {/* Hero image */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
          <Image
            src={spoonRecipe.image}
            alt={spoonRecipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 700px"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#0B2027] text-balance">
          {spoonRecipe.title}
        </h1>
        {spoonRecipe.summary && (
          <p className="text-sm text-[#1A5142] mt-1 leading-relaxed line-clamp-3">
            {spoonRecipe.summary}
          </p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mt-3 mb-6">
          {spoonRecipe.readyInMinutes > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-[#F0F9D3] text-[#1A5142] text-xs font-semibold px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              {spoonRecipe.readyInMinutes} min
            </span>
          )}
          {spoonRecipe.servings > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-[#F0F9D3] text-[#1A5142] text-xs font-semibold px-3 py-1.5 rounded-full">
              <Users className="h-3.5 w-3.5" />
              {spoonRecipe.servings} serving{spoonRecipe.servings !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Nutrition card */}
        {(n.carbs != null || n.calories != null) && (
          <div className="bg-[#F0F9D3] rounded-2xl p-5 mb-6">
            <h2 className="text-base font-semibold text-[#0B2027] mb-3">
              Nutrition per serving
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {n.carbs != null && (
                <div className="bg-white rounded-xl p-3 text-center col-span-2">
                  <p className="text-3xl font-bold text-[#00A375]">{n.carbs}g</p>
                  <p className="text-xs text-[#1A5142] mt-0.5">Carbs</p>
                </div>
              )}
              {n.calories != null && (
                <NutrientTile label="Calories" value={`${n.calories}`} unit="kcal" />
              )}
              {n.protein != null && (
                <NutrientTile label="Protein" value={`${n.protein}`} unit="g" />
              )}
              {n.fat != null && (
                <NutrientTile label="Fat" value={`${n.fat}`} unit="g" />
              )}
              {n.fiber != null && (
                <NutrientTile label="Fiber" value={`${n.fiber}`} unit="g" />
              )}
              {n.sugar != null && (
                <NutrientTile label="Sugar" value={`${n.sugar}`} unit="g" />
              )}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {spoonRecipe.ingredients.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0B2027] mb-3">
              Ingredients
            </h2>
            <ul className="flex flex-col gap-1.5">
              {spoonRecipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-[#0B2027] flex items-start gap-2">
                  <span className="text-[#1A5142] mt-0.5">{"•"}</span>
                  {ing.amount > 0 && (
                    <span className="font-medium">
                      {ing.amount} {ing.unit}
                    </span>
                  )}{" "}
                  {ing.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Method */}
        {spoonRecipe.steps.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0B2027] mb-3">
              Method
            </h2>
            <ol className="flex flex-col gap-4">
              {spoonRecipe.steps.map((s) => (
                <li key={s.number} className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[#00A375] text-white text-xs font-bold">
                    {s.number}
                  </span>
                  <p className="text-sm text-[#0B2027] leading-relaxed pt-0.5">
                    {s.step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    )
  }

  /* ---------- Local fallback recipe ---------- */
  if (localRecipe) {
    return (
      <div className="p-4 lg:p-8 max-w-2xl">
        {error && (
          <div className="flex items-start gap-2 bg-[#FED359]/20 border border-[#FED359] rounded-xl p-3 mb-4 text-sm text-[#0B2027]">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#8D7338]" />
            <span>{error} Showing local recipe.</span>
          </div>
        )}

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
          <Image
            src={localRecipe.image}
            alt={localRecipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 700px"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-[#0B2027] text-balance">
          {localRecipe.title}
        </h1>
        <p className="text-[#1A5142] mt-1 mb-6">{localRecipe.subheading}</p>

        <h2 className="text-lg font-semibold text-[#0B2027] mb-3">Ingredients</h2>
        <ul className="flex flex-col gap-1.5 mb-6">
          {localRecipe.ingredients.map((ing, i) => (
            <li key={i} className="text-sm text-[#0B2027] flex items-start gap-2">
              <span className="text-[#1A5142] mt-0.5">{"•"}</span>
              {ing}
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-semibold text-[#0B2027] mb-3">Method</h2>
        <p className="text-[#0B2027] leading-relaxed">{localRecipe.method}</p>
      </div>
    )
  }

  /* ---------- Not found / unavailable ---------- */
  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <div className="bg-[#F0F9D3] rounded-2xl p-6 text-center">
        <h2 className="text-lg font-semibold text-[#0B2027] mb-2">
          Recipe details unavailable
        </h2>
        <p className="text-sm text-[#1A5142] leading-relaxed mb-4">
          {error ?? "This recipe could not be loaded. It may have been removed or the service is temporarily unavailable."}
        </p>
        <a
          href="/eat"
          className="inline-flex items-center gap-2 bg-[#00A375] text-white rounded-2xl px-5 py-3 font-medium hover:bg-[#009066] transition-colors text-sm"
        >
          Browse meal types
        </a>
      </div>
    </div>
  )
}

/* Small helper component for the nutrition grid */
function NutrientTile({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="bg-white rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-[#0B2027]">
        {value}
        <span className="text-xs font-normal text-[#1A5142] ml-0.5">{unit}</span>
      </p>
      <p className="text-xs text-[#1A5142] mt-0.5">{label}</p>
    </div>
  )
}
