"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features-section" },
    { name: "How It Works", href: "#workflow-section" },
    { name: "Vision", href: "#vision-section" },
    { name: "Testimonials", href: "#testimonials-section" },
    { name: "FAQ", href: "#faq-section" },
  ]

  const [activeTab, setActiveTab] = useState("Home")

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string, name: string) => {
    e.preventDefault()
    setActiveTab(name)
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="w-full py-4 px-6 bg-gradient-to-r from-primary-light/30 to-background border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-foreground text-xl font-semibold">Pawtine</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href, item.name)}
                className={`relative text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === item.name ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
                {activeTab === item.name && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in slide-in-from-bottom-1" />
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#cta-bottom" rel="noopener noreferrer" className="hidden md:block">
            <Button className="px-6 py-2 rounded-lg font-medium shadow-sm">Get Started Free</Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-background border-t border-border text-foreground">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-semibold text-foreground">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleScroll(e, item.href, item.name)}
                    className={`justify-start text-lg py-2 transition-colors ${
                      activeTab === item.name
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href="#cta-bottom" rel="noopener noreferrer" className="w-full mt-4">
                  <Button className="w-full px-6 py-2 rounded-lg font-medium shadow-sm">Get Started Free</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
