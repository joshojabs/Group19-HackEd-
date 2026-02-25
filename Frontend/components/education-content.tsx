"use client"

import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { fetchArticles } from "@/lib/api"
import type { Article } from "@/lib/mockData"
import { ArticleCard } from "@/components/article-card"
import { Skeleton } from "@/components/ui/skeleton"

export function EducationContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles().then((data) => {
      setArticles(data)
      setLoading(false)
    })
  }, [])

  const sections = ["Section 1", "Section 2", "Section 3"]

  if (loading) {
    return (
      <div className="p-4 lg:p-8 flex flex-col gap-6">
        {sections.map((s) => (
          <div key={s}>
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="aspect-[4/3] rounded-2xl" />
              <Skeleton className="aspect-[4/3] rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const grouped = sections.map((section) => ({
    section,
    articles: articles.filter((a) => a.section === section),
  }))

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col gap-8 lg:gap-10">
        {grouped.map(({ section, articles: sectionArticles }) => (
          <div key={section}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">{section}</h2>
              <button
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`View all ${section}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {sectionArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
