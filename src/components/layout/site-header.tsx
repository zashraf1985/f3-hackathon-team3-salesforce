"use client"

import { Sun, Moon, PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/layout/mobile-nav"

interface SiteHeaderProps {
  isCollapsed: boolean;
  onCollapse: () => void;
}

export function SiteHeader({ isCollapsed, onCollapse }: SiteHeaderProps) {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between" style={{ paddingLeft: "1rem" }}>
        <div className="flex items-center space-x-2">
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
              <SheetHeader className="px-4 pt-4">
                <SheetTitle></SheetTitle>
              </SheetHeader>
              <MobileNav />
            </SheetContent>
          </Sheet>

          {/* Desktop Collapse Button */}
          <div 
            className="hidden md:flex items-center cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={onCollapse}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  )
} 