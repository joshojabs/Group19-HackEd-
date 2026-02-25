"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Utensils,
  Copy,
  Check,
  Loader2,
  Package,
  ChevronRight,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { defaultIngredients, type Ingredient } from "@/lib/mockData"
import type { ScannedProduct } from "@/lib/types"
import { useGlucaStore } from "@/lib/store"
import { toast } from "sonner"

export function ScannerContent() {
  const router = useRouter()

  const setScannedProduct = useGlucaStore((s) => s.setScannedProduct)
  const setSelectedIngredients = useGlucaStore(
    (s) => s.setSelectedIngredients
  )

  const [ingredients, setIngredients] =
    useState<Ingredient[]>(defaultIngredients)
  const [barcodeValue, setBarcodeValue] = useState<string | null>(null)
  const [product, setProduct] = useState<ScannedProduct | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggleIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  /* ---- Look up barcode via our server-side proxy ---- */
  const lookupProduct = useCallback(
    async (code: string) => {
      setLookingUp(true)
      try {
        const res = await fetch(
          `/api/openfoodfacts?barcode=${encodeURIComponent(code)}`
        )
        const data = await res.json()

        if (data.found && data.product) {
          const p: ScannedProduct = data.product
          setProduct(p)
          setScannedProduct(p)

          // Auto-add scanned product name to the ingredient list
          if (p.name) {
            setIngredients((prev) => {
              const exists = prev.some(
                (i) => i.name.toLowerCase() === p.name!.toLowerCase()
              )
              if (exists) {
                return prev.map((i) =>
                  i.name.toLowerCase() === p.name!.toLowerCase()
                    ? { ...i, checked: true }
                    : i
                )
              }
              return [
                { id: `scanned-${code}`, name: p.name!, checked: true },
                ...prev,
              ]
            })
          }

          // Auto-add parsed ingredient keywords as checked items
          if (p.parsedIngredients && p.parsedIngredients.length > 0) {
            setIngredients((prev) => {
              const existingNames = new Set(prev.map((i) => i.name.toLowerCase()))
              const newItems = p.parsedIngredients!
                .filter((ing) => !existingNames.has(ing.toLowerCase()))
                .map((ing, idx) => ({
                  id: `parsed-${code}-${idx}`,
                  name: ing.charAt(0).toUpperCase() + ing.slice(1),
                  checked: true,
                }))
              return [...prev, ...newItems]
            })
          }

          toast.success("Product found: " + (p.name ?? code))
        } else {
          setProduct({ barcode: code })
          setScannedProduct({ barcode: code })
          toast.info("Barcode scanned. Product not found in Open Food Facts.")
        }
      } catch {
        setProduct({ barcode: code })
        setScannedProduct({ barcode: code })
        toast.error("Failed to look up product. Barcode saved.")
      } finally {
        setLookingUp(false)
      }
    },
    [setScannedProduct]
  )

  /* Called when the camera or manual entry produces a barcode string */
  const handleBarcodeDetected = useCallback(
    (code: string) => {
      setBarcodeValue(code)
      toast.success("Barcode reading successful")
      lookupProduct(code)
    },
    [lookupProduct]
  )

  const handleCopyCode = async () => {
    if (!barcodeValue) return
    try {
      await navigator.clipboard.writeText(barcodeValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy code")
    }
  }

  const handleUseForRecipes = () => {
    // Push checked ingredient names into the store
    const checked = ingredients.filter((i) => i.checked).map((i) => i.name)
    setSelectedIngredients(checked)
    router.push("/eat")
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Meal planner checklist */}
        <div className="flex-1 lg:max-w-md">
          <h2 className="text-xl font-bold text-[#0B2027] mb-1">
            Meal Planner
          </h2>
          <p className="text-sm text-[#1A5142] mb-4 leading-relaxed">
            {"Have some ready made food? Scan in the barcode to add a food product to the list. Choose other items from the list as well."}
          </p>

          <div className="bg-white rounded-2xl border border-[#d4e5c9] overflow-hidden">
            {ingredients.map((item, index) => (
              <label
                key={item.id}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F0F9D3]/40 transition-colors ${
                  index !== ingredients.length - 1
                    ? "border-b border-[#d4e5c9]"
                    : ""
                } ${item.checked ? "bg-[#00A375]/10" : ""}`}
              >
                <span
                  className={`text-sm ${
                    item.checked
                      ? "font-semibold text-[#0B2027]"
                      : "text-[#0B2027]"
                  }`}
                >
                  {item.name}
                </span>
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggleIngredient(item.id)}
                  className="data-[state=checked]:bg-[#00A375] data-[state=checked]:border-[#00A375]"
                />
              </label>
            ))}
          </div>

          {/* Barcode result + product panel */}
          {barcodeValue && (
            <div className="mt-4 bg-[#F0F9D3] rounded-2xl p-4">
              {lookingUp ? (
                <div className="flex items-center gap-3 text-[#1A5142]">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">
                    Looking up product...
                  </span>
                </div>
              ) : product ? (
                <div className="flex flex-col gap-3">
                  {/* Product info */}
                  <div className="flex gap-3 items-start">
                    {product.image ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white">
                        <Image
                          src={product.image}
                          alt={product.name ?? "Product"}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shrink-0">
                        <Package className="h-7 w-7 text-[#1A5142]/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0B2027] truncate">
                        {product.name ?? "Unknown product"}
                      </p>
                      {product.brand && (
                        <p className="text-xs text-[#1A5142] truncate">
                          {product.brand}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-[#1A5142]/70 font-mono">
                          {barcodeValue}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className="text-[#00A375] hover:opacity-80 transition-opacity"
                          aria-label="Copy barcode"
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* "Use this item" button */}
                  <button
                    onClick={handleUseForRecipes}
                    className="flex items-center justify-center gap-2 bg-[#007051] text-white rounded-2xl px-4 py-3 font-medium hover:bg-[#005c42] transition-colors text-sm"
                  >
                    <Utensils className="h-4 w-4" />
                    Use this item to find recipes
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[#0B2027]">
                  {"Barcode scanned: "}
                  {barcodeValue}
                </p>
              )}
            </div>
          )}

          {/* Mobile action buttons */}
          <div className="flex justify-center gap-6 mt-6 lg:hidden">
            <button
              onClick={handleUseForRecipes}
              className="w-16 h-16 rounded-full bg-[#00A375] text-white flex items-center justify-center shadow-lg hover:bg-[#009066] transition-colors"
              aria-label="Choose meal type"
            >
              <Utensils className="h-7 w-7" />
            </button>
          </div>

          {barcodeValue && !lookingUp && (
            <p className="text-sm text-[#00A375] font-medium mt-3 text-center lg:text-left">
              Barcode reading successful
            </p>
          )}
        </div>

        {/* Right panel */}
        <div className="flex flex-col flex-1 lg:max-w-md gap-4">
          {/* Barcode scanner */}
          <div className="bg-[#F0F9D3] rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-[#1A5142] uppercase tracking-wider mb-3">
              Barcode Scanner
            </h3>
            <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
          </div>

          {/* Desktop action buttons */}
          <div className="hidden lg:flex flex-col gap-3">
            <button
              onClick={handleUseForRecipes}
              className="flex items-center justify-center gap-2 bg-[#00A375] text-white rounded-2xl px-5 py-4 hover:bg-[#009066] transition-colors font-medium"
            >
              <Utensils className="h-5 w-5" />
              Choose meal type
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
