"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Utensils, ScanBarcode, Activity } from "lucide-react"
import { GlucoseGauge } from "@/components/glucose-gauge"
import { useGlucaStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

export function HomeContent() {
  const glucose = useGlucaStore((s) => s.glucose)
  const setGlucose = useGlucaStore((s) => s.setGlucose)

  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [demoLevel, setDemoLevel] = useState(glucose.value)

  useEffect(() => {
    // Simulated fetch - replace with real CGM data later
    const timer = setTimeout(() => {
      setDemoLevel(glucose.value)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [glucose.value])

  const displayLevel = demoMode ? demoLevel : glucose.value

  // When demo slider changes, also push into store so suggestions page can use it
  const handleDemoLevelChange = (val: number) => {
    setDemoLevel(val)
    setGlucose({ ...glucose, value: val })
  }

  const actions = [
    { label: "Check out some recipes", href: "/eat", icon: Utensils },
    { label: "Scan a barcode", href: "/scanner", icon: ScanBarcode },
    { label: "Maintaining your level", href: "/education", icon: Activity },
  ]

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
        {/* Glucose gauge card */}
        <div className="bg-[#F0F9D3] rounded-3xl p-6 flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <Skeleton className="h-[160px] w-[280px] rounded-2xl" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
          ) : (
            <>
              <GlucoseGauge
                level={displayLevel}
                demoMode={demoMode}
                onLevelChange={handleDemoLevelChange}
              />
              <p className="text-xl font-bold text-[#0B2027] mt-3">
                {"Current level: "}
                <span className="font-bold">{displayLevel.toFixed(1)}</span>
              </p>
              <p className="text-sm text-[#1A5142] mt-0.5">
                {"Last recorded "}
                {glucose.recordedAt}
              </p>

              {/* Demo mode toggle */}
              <button
                onClick={() => setDemoMode(!demoMode)}
                className="mt-3 text-[10px] text-[#1A5142]/50 underline hover:text-[#1A5142]/80 transition-colors"
              >
                {demoMode ? "Hide demo slider" : "Demo mode"}
              </button>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Quick status -- desktop only */}
          <div className="hidden lg:block bg-[#F0F9D3] rounded-3xl p-6">
            <h3 className="text-xs font-semibold text-[#1A5142] uppercase tracking-wider mb-3">
              Quick Status
            </h3>
            {loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-[#0B2027]">
                    {displayLevel.toFixed(1)}
                  </p>
                  <p className="text-xs text-[#1A5142]">
                    {"Last recorded "}
                    {glucose.recordedAt}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#76C893] text-[#0B2027]">
                  {glucose.value <= 4.0
                    ? "Low"
                    : glucose.value >= 8.0
                      ? "High"
                      : "In Range"}
                </span>
              </div>
            )}
          </div>

          {/* Suggested actions */}
          <div>
            <h2 className="text-xs font-semibold text-[#1A5142] uppercase tracking-wider mb-3">
              Suggested actions
            </h2>
            <div className="flex flex-col gap-3">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between bg-[#007051] text-white rounded-2xl px-5 py-4 hover:bg-[#005c42] transition-colors"
                >
                  <span className="font-medium text-[15px]">
                    {action.label}
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
