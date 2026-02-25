"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Camera, CameraOff, Keyboard } from "lucide-react"

interface BarcodeScannerProps {
  onBarcodeDetected: (code: string) => void
}

export function BarcodeScanner({ onBarcodeDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const controlsRef = useRef<any>(null)

  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [showManual, setShowManual] = useState(false)

  const stopScanner = useCallback(() => {
    if (controlsRef.current) {
      try { controlsRef.current.stop() } catch { /* already stopped */ }
      controlsRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }, [])

  const startScanner = useCallback(async () => {
    setError(null)

    try {
      // Dynamic import to avoid SSR issues
      const { BrowserMultiFormatReader } = await import("@zxing/browser")
      const { BarcodeFormat, DecodeHintType } = await import("@zxing/library")

      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE,
      ])

      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 200,
      })
      readerRef.current = reader

      if (!videoRef.current) return

      setScanning(true)

      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText()
            onBarcodeDetected(code)
            stopScanner()
          }
          // Ignore scan-miss errors (no code in frame)
        }
      )

      controlsRef.current = controls
      streamRef.current = videoRef.current.srcObject as MediaStream
    } catch (err: any) {
      const msg = err?.message ?? ""
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Camera access denied. Please allow camera permission.")
      } else {
        setError("Could not start camera. Try manual entry instead.")
      }
      setScanning(false)
    }
  }, [onBarcodeDetected, stopScanner])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        try { controlsRef.current.stop() } catch { /* noop */ }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = manualCode.trim()
    if (trimmed) {
      onBarcodeDetected(trimmed)
      setManualCode("")
      setShowManual(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Camera preview */}
      <div className="relative w-full bg-[#0B2027]/5 rounded-2xl overflow-hidden min-h-[200px] flex items-center justify-center">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover rounded-2xl ${scanning ? "block" : "hidden"}`}
          muted
          playsInline
        />

        {!scanning && !error && (
          <div className="flex flex-col items-center gap-3 text-[#1A5142] p-6 text-center">
            <Camera className="h-10 w-10 opacity-60" />
            <p className="text-sm">Press Start Scanning to open your camera</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 text-[#DF6767] p-6 text-center">
            <CameraOff className="h-10 w-10" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Scanning frame overlay */}
        {scanning && !error && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="relative w-[240px] h-[140px]">
              <span className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-[#00A375] rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-[#00A375] rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-[#00A375] rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-[#00A375] rounded-br-lg" />
              {/* Scanning line animation */}
              <span className="absolute left-3 right-3 h-0.5 bg-[#00A375]/70 top-1/2 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!scanning ? (
          <button
            onClick={startScanner}
            className="flex-1 flex items-center justify-center gap-2 bg-[#00A375] text-white rounded-xl px-4 py-3 font-medium hover:bg-[#009066] transition-colors"
          >
            <Camera className="h-5 w-5" />
            Start scanning
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="flex-1 flex items-center justify-center gap-2 bg-[#DF6767] text-white rounded-xl px-4 py-3 font-medium hover:bg-[#c55555] transition-colors"
          >
            <CameraOff className="h-5 w-5" />
            Stop scanning
          </button>
        )}
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex items-center justify-center gap-2 bg-white text-[#0B2027] border border-[#d4e5c9] rounded-xl px-4 py-3 font-medium hover:bg-[#F0F9D3] transition-colors"
          aria-label="Manual entry"
        >
          <Keyboard className="h-5 w-5" />
        </button>
      </div>

      {/* Manual entry fallback */}
      {showManual && (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter barcode manually..."
            className="flex-1 rounded-xl border border-[#d4e5c9] bg-white px-4 py-3 text-sm text-[#0B2027] placeholder:text-[#1A5142]/50 focus:outline-none focus:ring-2 focus:ring-[#00A375]"
          />
          <button
            type="submit"
            className="bg-[#00A375] text-white rounded-xl px-5 py-3 text-sm font-medium hover:bg-[#009066] transition-colors"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  )
}
