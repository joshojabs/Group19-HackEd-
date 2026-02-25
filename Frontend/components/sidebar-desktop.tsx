"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Utensils, ScanBarcode, BookOpen, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/eat", icon: Utensils, label: "Eat" },
  { href: "/scanner", icon: ScanBarcode, label: "Scanner" },
  { href: "/education", icon: BookOpen, label: "Education" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function SidebarDesktop() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-sidebar text-sidebar-foreground z-50">
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-sidebar-foreground">Gluca</h2>
      </div>
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 text-xs text-sidebar-foreground/50">
        Gluca v1.0 MVP
      </div>
    </aside>
  )
}
