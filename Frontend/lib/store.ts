import { create } from "zustand"
import type { GlucoseReading, ScannedProduct } from "./types"

interface GlucaState {
  /* Glucose */
  glucose: GlucoseReading
  setGlucose: (g: GlucoseReading) => void

  /* Scanned product (populated after barcode scan + OFF lookup) */
  scannedProduct: ScannedProduct | null
  setScannedProduct: (p: ScannedProduct | null) => void

  /* Checked ingredient names (from scanner checklist) */
  selectedIngredients: string[]
  setSelectedIngredients: (names: string[]) => void
}

export const useGlucaStore = create<GlucaState>((set) => ({
  glucose: { value: 6.5, unit: "mmol/L", recordedAt: "14:00" },
  setGlucose: (g) => set({ glucose: g }),

  scannedProduct: null,
  setScannedProduct: (p) => set({ scannedProduct: p }),

  selectedIngredients: [],
  setSelectedIngredients: (names) => set({ selectedIngredients: names }),
}))
