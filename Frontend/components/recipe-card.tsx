import Image from "next/image"
import Link from "next/link"
import type { Recipe } from "@/lib/mockData"

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="group block"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 33vw, 200px"
        />
      </div>
      <p className="text-xs text-primary font-medium mt-1.5 truncate">
        {recipe.title}
      </p>
    </Link>
  )
}
