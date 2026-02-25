"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface TopHeaderProps {
  title: string
  showBack?: boolean
}

export function TopHeader({ title, showBack = false }: TopHeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-[#00A375] text-white px-5 py-3.5 flex items-center gap-3 min-h-[52px]">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="p-1 hover:opacity-80 transition-opacity"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="text-lg font-semibold">{title}</h1>

    </header>
  )
}
