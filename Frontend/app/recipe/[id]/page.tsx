import { TopHeader } from "@/components/top-header"
import { RecipeDetail } from "@/components/recipe-detail"

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <>
      <TopHeader title="Recipe" showBack />
      <RecipeDetail id={id} />
    </>
  )
}
