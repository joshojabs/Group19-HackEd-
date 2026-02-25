import { TopHeader } from "@/components/top-header"
import { RecommendationsContent } from "@/components/recommendations-content"

export default function RecommendationsPage() {
  return (
    <>
      <TopHeader title="Food Scanner" showBack />
      <RecommendationsContent />
    </>
  )
}
