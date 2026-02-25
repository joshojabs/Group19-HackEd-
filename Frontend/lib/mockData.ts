export interface GlucoseReading {
  level: number
  lastRecorded: string
  status: "low" | "in-range" | "high"
}

export interface Article {
  slug: string
  title: string
  subheading: string
  section: string
  image: string
  content: string
}

export interface Ingredient {
  id: string
  name: string
  checked: boolean
}

export interface Recipe {
  id: string
  title: string
  subheading: string
  description: string
  image: string
  time: string
  mealType: string
  ingredients: string[]
  method: string
  featured?: boolean
}

export interface Recommendation {
  id: string
  label: string
  selected: boolean
}

export const glucoseData: GlucoseReading = {
  level: 6.5,
  lastRecorded: "14:00",
  status: "in-range",
}

export const articles: Article[] = [
  {
    slug: "understanding-glucose",
    title: "Understanding Glucose Levels",
    subheading: "A beginner's guide",
    section: "Section 1",
    image: "/images/books.jpg",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.",
  },
  {
    slug: "managing-type-2",
    title: "Managing Type 2 Diabetes",
    subheading: "Daily routines that help",
    section: "Section 1",
    image: "/images/books.jpg",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
  },
  {
    slug: "nutrition-basics",
    title: "Nutrition Basics",
    subheading: "What to eat and when",
    section: "Section 2",
    image: "/images/books.jpg",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
  },
  {
    slug: "carb-counting",
    title: "Carb Counting Guide",
    subheading: "Mastering your intake",
    section: "Section 2",
    image: "/images/books.jpg",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor.",
  },
  {
    slug: "exercise-and-glucose",
    title: "Exercise & Glucose",
    subheading: "How movement helps",
    section: "Section 3",
    image: "/images/books.jpg",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.",
  },
  {
    slug: "stress-management",
    title: "Stress & Blood Sugar",
    subheading: "The hidden connection",
    section: "Section 3",
    image: "/images/books.jpg",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor.",
  },
]

export const defaultIngredients: Ingredient[] = [
  { id: "1", name: "Findus Crispy Pancake", checked: true },
  { id: "2", name: "Carrots", checked: false },
  { id: "3", name: "Potatoes", checked: false },
  { id: "4", name: "Celery", checked: false },
  { id: "5", name: "Brown Rice", checked: false },
  { id: "6", name: "Cauliflower", checked: false },
  { id: "7", name: "Cucumber", checked: false },
  { id: "8", name: "Brown Bread", checked: false },
]

export const recipes: Recipe[] = [
  {
    id: "spicy-udon",
    title: "Spicy Gochujang Udon Noodles",
    subheading: "Quick Korean-inspired dish",
    description:
      "This quick Korean-inspired gochujang noodle stir-fry is packed with flavour and takes 10 minutes, making it the perfect midweek meal.",
    image: "/images/udon.jpg",
    time: "30 min",
    mealType: "lunch",
    featured: true,
    ingredients: [
      "200g udon noodles",
      "2 tbsp gochujang paste",
      "1 tbsp soy sauce",
      "1 tbsp sesame oil",
      "2 cloves garlic, minced",
      "1 spring onion, sliced",
      "1 egg",
      "Sesame seeds to garnish",
    ],
    method:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Sit amet consectetur adipiscing elit quisque faucibus ex. Adipiscing elit quisque faucibus ex sapien vitae pellentesque.",
  },
  {
    id: "green-salad",
    title: "Mediterranean Green Salad",
    subheading: "Fresh and light",
    description: "A light and refreshing salad with feta cheese and olives, perfect for a healthy lunch.",
    image: "/images/salad.jpg",
    time: "15 min",
    mealType: "lunch",
    ingredients: ["Mixed greens", "Cherry tomatoes", "Cucumber", "Feta cheese", "Kalamata olives", "Olive oil", "Lemon juice"],
    method: "Toss all ingredients together in a large bowl. Drizzle with olive oil and lemon juice. Season to taste.",
  },
  {
    id: "veggie-stir-fry",
    title: "Vegetable Stir Fry",
    subheading: "Colorful and nutritious",
    description: "A quick and colorful stir fry loaded with fresh vegetables and a savory sauce.",
    image: "/images/curry.jpg",
    time: "20 min",
    mealType: "dinner",
    featured: true,
    ingredients: ["Broccoli", "Bell peppers", "Snap peas", "Carrots", "Soy sauce", "Ginger", "Garlic", "Sesame oil"],
    method: "Heat sesame oil in a wok. Add garlic and ginger, then vegetables. Stir fry for 5 minutes. Add soy sauce and serve.",
  },
  {
    id: "overnight-oats",
    title: "Berry Overnight Oats",
    subheading: "Prep the night before",
    description: "Creamy overnight oats topped with fresh berries and a drizzle of honey.",
    image: "/images/smoothie.jpg",
    time: "5 min prep",
    mealType: "breakfast",
    featured: true,
    ingredients: ["Rolled oats", "Greek yogurt", "Almond milk", "Mixed berries", "Honey", "Chia seeds"],
    method: "Combine oats, yogurt, milk, and chia seeds in a jar. Refrigerate overnight. Top with berries and honey before serving.",
  },
  {
    id: "avocado-toast",
    title: "Avocado Toast with Egg",
    subheading: "Classic and satisfying",
    description: "Perfectly ripe avocado on sourdough toast, topped with a poached egg.",
    image: "/images/breakfast.jpg",
    time: "10 min",
    mealType: "breakfast",
    ingredients: ["Sourdough bread", "Ripe avocado", "Eggs", "Chili flakes", "Lime juice", "Salt and pepper"],
    method: "Toast sourdough. Mash avocado with lime juice and season. Poach an egg. Assemble and garnish with chili flakes.",
  },
  {
    id: "energy-balls",
    title: "Peanut Butter Energy Balls",
    subheading: "No-bake snack",
    description: "Healthy no-bake energy balls made with oats and peanut butter.",
    image: "/images/snack.jpg",
    time: "10 min",
    mealType: "snack",
    featured: true,
    ingredients: ["Rolled oats", "Peanut butter", "Honey", "Dark chocolate chips", "Flaxseed"],
    method: "Mix all ingredients. Roll into balls. Refrigerate for 30 minutes. Enjoy as a healthy snack.",
  },
  {
    id: "hummus-veggies",
    title: "Hummus & Veggie Sticks",
    subheading: "Simple and healthy",
    description: "Creamy homemade hummus served with fresh vegetable sticks.",
    image: "/images/salad.jpg",
    time: "15 min",
    mealType: "snack",
    ingredients: ["Chickpeas", "Tahini", "Lemon juice", "Garlic", "Carrots", "Celery", "Bell peppers"],
    method: "Blend chickpeas, tahini, lemon juice, and garlic until smooth. Serve with fresh veggie sticks.",
  },
  {
    id: "grilled-salmon",
    title: "Grilled Salmon with Asparagus",
    subheading: "Omega-3 rich dinner",
    description: "Perfectly grilled salmon fillet served with roasted asparagus and lemon.",
    image: "/images/dinner.jpg",
    time: "25 min",
    mealType: "dinner",
    ingredients: ["Salmon fillet", "Asparagus", "Olive oil", "Lemon", "Garlic", "Dill", "Salt and pepper"],
    method: "Season salmon and asparagus. Grill salmon for 4 min each side. Roast asparagus at 200C for 12 min. Serve with lemon.",
  },
]

export const defaultRecommendations: Recommendation[] = [
  { id: "1", label: "Recommendation 1", selected: true },
  { id: "2", label: "Recommendation 2", selected: true },
  { id: "3", label: "Recommendation 3", selected: true },
]

export const mealTypes = [
  { id: "breakfast", label: "Breakfast", image: "/images/breakfast.jpg" },
  { id: "lunch", label: "Lunch", image: "/images/lunch.jpg" },
  { id: "dinner", label: "Dinner", image: "/images/dinner.jpg" },
  { id: "snack", label: "Snack", image: "/images/snack.jpg" },
]
