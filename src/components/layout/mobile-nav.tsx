"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bot, Settings, Boxes, Home } from "lucide-react"

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home
  },
  {
    name: "Agents",
    href: "/agents",
    icon: Bot
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings
  }
] as const

export function MobileNav() {
  const pathname = usePathname()
  
  return (
    <div className="flex flex-col gap-4 p-4 bg-background h-full">
      <Link href="/" className="flex items-center gap-2">
        <Boxes className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl">AgentDock.ai</span>
      </Link>
      <div className="flex flex-col gap-1">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  )
} 