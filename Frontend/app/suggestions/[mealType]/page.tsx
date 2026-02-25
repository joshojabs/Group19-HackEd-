import { TopHeader } from "@/components/top-header"
import { SuggestionsContent } from "@/components/suggestions-content"

export default async function SuggestionsPage({
  params,
}: {
  params: Promise<{ mealType: string }>
}) {
  const { mealType } = await params
  const label = mealType.charAt(0).toUpperCase() + mealType.slice(1)
  return (
    <>
      <TopHeader title={label} showBack />
      <SuggestionsContent mealType={mealType} />
    </>
  )
}
