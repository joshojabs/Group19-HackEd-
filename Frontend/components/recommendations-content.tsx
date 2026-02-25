"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { fetchRecommendations } from "@/lib/api"
import type { Recommendation } from "@/lib/mockData"
import { Skeleton } from "@/components/ui/skeleton"

export function RecommendationsContent() {
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [scannedItem] = useState("Findus Crispy Pancake")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations().then((data) => {
      setRecs(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-md mx-auto lg:mx-0">
        <h2 className="text-xl font-bold text-foreground mb-1">
          Meal Preparation
        </h2>
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          You have scanned in:
        </p>
        <p className="text-lg font-bold text-foreground mb-4">
          {scannedItem}
        </p>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          We suggest the following for a balanced diet:
        </p>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {recs.map((rec, index) => (
            <div
              key={rec.id}
              className={`flex items-center justify-between px-4 py-4 ${
                index !== recs.length - 1 ? "border-b border-border" : ""
              } ${rec.selected ? "bg-primary/10" : ""}`}
            >
              <span className="text-sm font-medium text-foreground">
                {rec.label}
              </span>
              {rec.selected && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
