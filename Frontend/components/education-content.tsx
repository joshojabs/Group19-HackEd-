"use client"

import type { Article } from "@/lib/mockData"
import { ArticleCard } from "@/components/article-card"
import { healthyBalancedDiabetesDiet } from "@/lib/articles/healthy-balanced-diabetes-diet"

export function EducationContent() {
  const article = healthyBalancedDiabetesDiet;

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col gap-8 lg:gap-10">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Education</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <ArticleCard key={article.slug} article={article} />
          </div>
        </div>
      </div>
    </div>
  )
}
