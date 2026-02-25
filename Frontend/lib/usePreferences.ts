"use client"

import { useCallback, useSyncExternalStore } from "react"
import type { DietaryPreferences } from "./types"

const STORAGE_KEY = "gluca-dietary-preferences"

const DEFAULT_PREFS: DietaryPreferences = {
  diet: undefined,
  intolerances: [],
  excludeIngredients: [],
}

/* ---------- tiny pub/sub so every hook instance stays in sync ---------- */
const listeners = new Set<() => void>()
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function emit() {
  listeners.forEach((cb) => cb())
}

/* ---------- snapshot helpers ---------- */
let cachedSnapshot: DietaryPreferences = DEFAULT_PREFS

function readFromStorage(): DietaryPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFS
  }
}

function getSnapshot(): DietaryPreferences {
  return cachedSnapshot
}

function getServerSnapshot(): DietaryPreferences {
  return DEFAULT_PREFS
}

/* Hydrate once on module load (client only) */
if (typeof window !== "undefined") {
  cachedSnapshot = readFromStorage()
}

/* ---------- hook ---------- */
export function usePreferences() {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const save = useCallback((next: DietaryPreferences) => {
    cachedSnapshot = next
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch { /* quota exceeded – ignore */ }
    emit()
  }, [])

  return { preferences, save }
}
