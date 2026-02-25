"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Utensils, ScanBarcode, BookOpen, User } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/eat", icon: Utensils, label: "Eat" },
  { href: "/scanner", icon: ScanBarcode, label: "Scanner", center: true },
  { href: "/education", icon: BookOpen, label: "Learn" },
  { href: "/profile", icon: User, label: "Profile" },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      aria-label="Main navigation"
    >
      {/* White bar */}
      <div className="bg-white border-t border-[#d4e5c9] flex items-end justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          /* Raised circular center button for Scanner */
          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-7"
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-colors ${
                    isActive
                      ? "bg-[#00A375] text-white"
                      : "bg-[#007051] text-white"
                  }`}
                >
                  <item.icon className="h-7 w-7" />
                </span>
                <span
                  className={`text-[10px] mt-0.5 font-medium ${
                    isActive ? "text-[#00A375]" : "text-[#0B2027]/50"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={`h-6 w-6 transition-colors ${
                  isActive ? "text-[#00A375]" : "text-[#0B2027]/40"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-[#00A375]" : "text-[#0B2027]/40"
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
