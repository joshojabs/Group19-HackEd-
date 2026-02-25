import Image from "next/image"
import Link from "next/link"
import type { Article } from "@/lib/mockData"

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/education/article/${article.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 200px"
        />
      </div>
      <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-lg">
        {article.title}
      </span>
    </Link>
  )
}
