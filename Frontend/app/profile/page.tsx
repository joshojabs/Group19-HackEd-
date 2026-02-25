"use client"

import { useState, useEffect } from "react"
import { TopHeader } from "@/components/top-header"
import { User, Bell, Shield, HelpCircle, LogOut, X, Plus } from "lucide-react"
import { usePreferences } from "@/lib/usePreferences"
import type { DietType, DietaryPreferences } from "@/lib/types"
import { toast } from "sonner"

const profileItems = [
  { label: "Personal Details", icon: User },
  { label: "Notifications", icon: Bell },
  { label: "Privacy & Security", icon: Shield },
  { label: "Help & Support", icon: HelpCircle },
]

const DIET_OPTIONS: { label: string; value: DietType | "" }[] = [
  { label: "None", value: "" },
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
  { label: "Pescetarian", value: "pescetarian" },
  { label: "Gluten Free", value: "gluten free" },
  { label: "Ketogenic", value: "ketogenic" },
  { label: "Paleo", value: "paleo" },
]

const INTOLERANCE_OPTIONS = [
  "gluten",
  "dairy",
  "egg",
  "peanut",
  "tree nut",
  "soy",
  "wheat",
  "shellfish",
  "sesame",
]

export default function ProfilePage() {
  const { preferences, save } = usePreferences()

  /* Local draft state – initialised from persisted preferences */
  const [diet, setDiet] = useState<DietType | undefined>(preferences.diet)
  const [intolerances, setIntolerances] = useState<string[]>(preferences.intolerances)
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>(preferences.excludeIngredients)
  const [excludeInput, setExcludeInput] = useState("")

  /* Sync draft if preferences change externally */
  useEffect(() => {
    setDiet(preferences.diet)
    setIntolerances(preferences.intolerances)
    setExcludeIngredients(preferences.excludeIngredients)
  }, [preferences])

  function toggleIntolerance(item: string) {
    setIntolerances((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  function addExclude() {
    const value = excludeInput.trim().toLowerCase()
    if (!value || excludeIngredients.includes(value)) return
    setExcludeIngredients((prev) => [...prev, value])
    setExcludeInput("")
  }

  function removeExclude(item: string) {
    setExcludeIngredients((prev) => prev.filter((i) => i !== item))
  }

  function handleSave() {
    const next: DietaryPreferences = {
      diet: diet || undefined,
      intolerances,
      excludeIngredients,
    }
    save(next)
    toast.success("Dietary requirements saved")
  }

  return (
    <>
      <TopHeader title="Profile" />
      <div className="p-4 lg:p-8 max-w-lg mx-auto lg:mx-0">
        {/* Profile avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#F0F9D3] flex items-center justify-center mb-3">
            <User className="h-10 w-10 text-[#1A5142]" />
          </div>
          <h2 className="text-lg font-bold text-[#0B2027]">User</h2>
          <p className="text-sm text-[#1A5142]">user@example.com</p>
        </div>

        {/* Profile items */}
        <div className="bg-white rounded-2xl border border-[#d4e5c9] overflow-hidden mb-8">
          {profileItems.map((item, index) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[#F0F9D3]/50 transition-colors ${
                index !== profileItems.length - 1 ? "border-b border-[#d4e5c9]" : ""
              }`}
            >
              <item.icon className="h-5 w-5 text-[#1A5142]" />
              <span className="text-sm font-medium text-[#0B2027]">{item.label}</span>
            </button>
          ))}
        </div>

        {/* ---------- Dietary Requirements ---------- */}
        <div className="bg-[#F0F9D3] rounded-2xl p-5 mb-6">
          <h3 className="text-base font-bold text-[#0B2027] mb-4">
            Dietary Requirements
          </h3>

          {/* Diet dropdown */}
          <label className="block text-sm font-semibold text-[#0B2027] mb-1.5">
            Diet
          </label>
          <select
            value={diet ?? ""}
            onChange={(e) => setDiet((e.target.value || undefined) as DietType | undefined)}
            className="w-full rounded-xl border border-[#d4e5c9] bg-white text-[#0B2027] text-sm px-3 py-2.5 mb-5 focus:outline-none focus:ring-2 focus:ring-[#00A375]"
          >
            {DIET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Intolerances multi-select chips */}
          <label className="block text-sm font-semibold text-[#0B2027] mb-2">
            Intolerances
          </label>
          <div className="flex flex-wrap gap-2 mb-5">
            {INTOLERANCE_OPTIONS.map((item) => {
              const active = intolerances.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleIntolerance(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    active
                      ? "bg-[#00A375] text-white"
                      : "bg-white text-[#0B2027] border border-[#d4e5c9] hover:border-[#00A375]"
                  }`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              )
            })}
          </div>

          {/* Exclude ingredients */}
          <label className="block text-sm font-semibold text-[#0B2027] mb-1.5">
            Exclude Ingredients
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={excludeInput}
              onChange={(e) => setExcludeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addExclude()
                }
              }}
              placeholder="Type and press Enter"
              className="flex-1 rounded-xl border border-[#d4e5c9] bg-white text-[#0B2027] text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00A375]"
            />
            <button
              type="button"
              onClick={addExclude}
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#00A375] text-white hover:bg-[#007051] transition-colors"
              aria-label="Add ingredient"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {excludeIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {excludeIngredients.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 bg-white text-[#0B2027] border border-[#d4e5c9] text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeExclude(item)}
                    className="text-[#1A5142] hover:text-[#DF6767] transition-colors"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 rounded-2xl bg-[#00A375] text-white font-semibold text-sm hover:bg-[#007051] transition-colors"
          >
            Save Dietary Requirements
          </button>
        </div>

        {/* Sign out */}
        <button className="w-full flex items-center justify-center gap-2 text-[#DF6767] font-medium py-3 rounded-2xl border border-[#DF6767]/30 hover:bg-[#DF6767]/5 transition-colors">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </>
  )
}
