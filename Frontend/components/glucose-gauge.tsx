"use client"

import { useEffect, useState } from "react"

interface GlucoseGaugeProps {
  /** Glucose level in mmol/L */
  level: number
  /** Show a demo slider to change the level */
  demoMode?: boolean
  onLevelChange?: (level: number) => void
}

const MIN_MMOL = 3.0
const MAX_MMOL = 12.0

/**
 * Maps a glucose value (mmol/L) to a needle angle in degrees.
 * -90 = far left (low), 0 = top center, +90 = far right (high).
 */
function glucoseToAngle(mmol: number): number {
  const clamped = Math.min(Math.max(mmol, MIN_MMOL), MAX_MMOL)
  // linear interpolation: 3.0 -> -90, 12.0 -> +90
  return ((clamped - MIN_MMOL) / (MAX_MMOL - MIN_MMOL)) * 180 - 90
}

/**
 * Builds an SVG arc path for a semi-circle segment.
 * startFrac / endFrac are 0..1 across the 180-degree arc (left to right).
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startFrac: number,
  endFrac: number
): string {
  // 0 frac = 180 deg (left), 1 frac = 0 deg (right)  in standard math coords
  const startAngle = Math.PI * (1 - startFrac)
  const endAngle = Math.PI * (1 - endFrac)
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy - r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy - r * Math.sin(endAngle)
  const sweep = 1 // always clockwise from left to right
  const large = endFrac - startFrac > 0.5 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`
}

/**
 * 5 segments matching the target gauge:
 * low (red) | mid (yellow) | good (green) | mid (yellow) | high (dark red)
 */
const SEGMENTS = [
  { startFrac: 0.0, endFrac: 0.2, color: "var(--c-low)" },
  { startFrac: 0.2, endFrac: 0.35, color: "var(--c-mid)" },
  { startFrac: 0.35, endFrac: 0.65, color: "var(--c-good)" },
  { startFrac: 0.65, endFrac: 0.8, color: "var(--c-mid)" },
  { startFrac: 0.8, endFrac: 1.0, color: "var(--c-high)" },
]

export function GlucoseGauge({
  level,
  demoMode = false,
  onLevelChange,
}: GlucoseGaugeProps) {
  const [animatedAngle, setAnimatedAngle] = useState(-90)
  const targetAngle = glucoseToAngle(level)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedAngle(targetAngle))
    return () => cancelAnimationFrame(raf)
  }, [targetAngle])

  const CX = 150
  const CY = 140
  const R = 100
  const STROKE = 24

  // Needle: angle 0 = straight up, -90 = left, +90 = right
  // In SVG terms, the needle rotates around (CX, CY). -90 means pointing left.
  // We rotate the SVG line from "straight up" by animatedAngle degrees.
  const needleLength = 78
  const needleAngleRad = ((animatedAngle - 90) * Math.PI) / 180
  const nx = CX + needleLength * Math.cos(needleAngleRad)
  const ny = CY + needleLength * Math.sin(needleAngleRad)

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 300 160"
        className="w-full max-w-[280px] lg:max-w-[340px]"
        role="img"
        aria-label={`Glucose level: ${level} mmol/L`}
      >
        {/* Gauge arc segments */}
        {SEGMENTS.map((seg, i) => (
          <path
            key={i}
            d={describeArc(CX, CY, R, seg.startFrac, seg.endFrac)}
            fill="none"
            stroke={seg.color}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        ))}

        {/* Needle line */}
        <line
          x1={CX}
          y1={CY}
          x2={nx}
          y2={ny}
          stroke="var(--c-ink)"
          strokeWidth={3.5}
          strokeLinecap="round"
          style={{ transition: "x2 1s ease-out, y2 1s ease-out" }}
        />

        {/* Center pivot */}
        <circle cx={CX} cy={CY} r={9} fill="var(--c-ink)" />
        <circle cx={CX} cy={CY} r={4} fill="var(--c-bg-cream)" />
      </svg>

      {/* Demo slider (hidden by default) */}
      {demoMode && (
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{MIN_MMOL}</span>
          <input
            type="range"
            min={MIN_MMOL}
            max={MAX_MMOL}
            step={0.1}
            value={level}
            onChange={(e) => onLevelChange?.(parseFloat(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span>{MAX_MMOL}</span>
        </div>
      )}
    </div>
  )
}
