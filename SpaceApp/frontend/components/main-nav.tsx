"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMemo, useCallback } from "react"

interface NavItem {
  path: string;
  label: string;
}

export function MainNav() {
  const pathname = usePathname() ?? "/"

  const isActive = useCallback((path: string): boolean => {
    return pathname === path
  }, [pathname])

  const navItems = useMemo<NavItem[]>(() => [
    { path: "/satellites", label: "Satellites" },
    { path: "/collision-detection", label: "Collision Detection" },
    { path: "/health-monitoring", label: "Health Monitoring" },
    { path: "/end-of-life", label: "End of Life" },
  ], [])

  return (
    <TooltipProvider>
      <nav className="flex items-center space-x-6 overflow-x-auto pb-1 hide-scrollbar">
        {navItems.map((item) => (
          <Tooltip key={item.path}>
            <TooltipTrigger asChild>
              <Link
                href={item.path}
                className={`nav-link ${isActive(item.path) ? "active" : ""}`}
              >
                <motion.span 
                  whileHover={{ y: -2 }} 
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {item.label}
                </motion.span>
                {isActive(item.path) && (
                  <motion.div
                    className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-[#3b82f6]"
                    layoutId="activeNavIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  )
}
