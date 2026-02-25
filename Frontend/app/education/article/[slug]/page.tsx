import { TopHeader } from "@/components/top-header"
import { ArticleDetail } from "@/components/article-detail"

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <>
      <TopHeader title="Article" showBack />
      <ArticleDetail slug={slug} />
    </>
  )
}
