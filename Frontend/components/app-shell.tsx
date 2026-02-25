"use client"

import { BottomNav } from "./bottom-nav"
import { SidebarDesktop } from "./sidebar-desktop"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarDesktop />
      <main className="lg:ml-60 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
