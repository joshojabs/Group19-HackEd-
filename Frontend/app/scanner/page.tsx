import { TopHeader } from "@/components/top-header"
import { ScannerContent } from "@/components/scanner-content"

export default function ScannerPage() {
  return (
    <>
      <TopHeader title="Food Scanner" showBack />
      <ScannerContent />
    </>
  )
}
