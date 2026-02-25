import {
  articles,
  defaultRecommendations,
  recipes,
  type Article,
  type Recipe,
  type Recommendation,
} from "./mockData"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchArticles(): Promise<Article[]> {
  await delay(400)
  return articles
}

export async function fetchArticle(slug: string): Promise<Article | undefined> {
  await delay(300)
  return articles.find((a) => a.slug === slug)
}

export async function fetchRecipes(mealType: string): Promise<Recipe[]> {
  await delay(500)
  return recipes.filter((r) => r.mealType === mealType)
}

export async function fetchRecipe(id: string): Promise<Recipe | undefined> {
  await delay(300)
  return recipes.find((r) => r.id === id)
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  await delay(400)
  return defaultRecommendations
}
