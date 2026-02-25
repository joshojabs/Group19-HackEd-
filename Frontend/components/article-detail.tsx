"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { fetchArticle, fetchArticles } from "@/lib/api"
import type { Article } from "@/lib/mockData"
import { ArticleCard } from "@/components/article-card"
import { Skeleton } from "@/components/ui/skeleton"

export function ArticleDetail({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | undefined>()
  const [related, setRelated] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchArticle(slug), fetchArticles()]).then(([art, all]) => {
      setArticle(art)
      setRelated(all.filter((a) => a.slug !== slug).slice(0, 4))
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <Skeleton className="w-full aspect-video rounded-2xl mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="p-4 lg:p-8">
        <p className="text-muted-foreground">Article not found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main article column */}
        <article className="flex-1 lg:max-w-[720px]">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 720px"
              priority
            />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground text-balance">
            {article.title}
          </h1>
          <p className="text-muted-foreground mt-1 mb-6">
            {article.subheading}
          </p>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Heading
            </h2>
            <p className="text-foreground leading-relaxed">
              {article.content}
            </p>
          </div>
        </article>

        {/* Related articles - desktop sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Related articles
          </h3>
          <div className="flex flex-col gap-4">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
