import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gluca - Glucose Management",
  description:
    "Manage your glucose levels, discover recipes, and learn about healthy eating with Gluca.",
}

export const viewport: Viewport = {
  themeColor: "#007051",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        <Toaster position="bottom-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}
