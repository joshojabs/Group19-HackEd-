"use client"

import Image from "next/image"
import Link from "next/link"
import { mealTypes } from "@/lib/mockData"

export function EatContent() {
  return (
    <div className="p-4 lg:p-8 flex items-start justify-center">
      <div className="grid grid-cols-2 gap-4 lg:gap-6 w-full max-w-lg">
        {mealTypes.map((meal) => (
          <Link
            key={meal.id}
            href={`/suggestions/${meal.id}`}
            className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-md transition-shadow bg-card"
          >
            <Image
              src={meal.image}
              alt={meal.label}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 240px"
            />
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-lg">
              {meal.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
