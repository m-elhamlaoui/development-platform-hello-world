"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMemo, useCallback, useEffect } from "react"
import { MotionDiv } from "@/components/ui/motion"

interface NavItem {
  path: string;
  label: string;
}

export function MainNav() {
  const pathname = usePathname() ?? "/"
  const router = useRouter()

  const isActive = useCallback((path: string): boolean => {
    return pathname === path
  }, [pathname])

  const navItems = useMemo<NavItem[]>(() => [
    { path: "/satellites", label: "Satellites" },
    { path: "/collision-detection", label: "Collision Detection" },
    { path: "/health-monitoring", label: "Health Monitoring" },
    { path: "/end-of-life", label: "End of Life" },
  ], [])

  // Handle navigation with immediate feedback
  const handleNavigation = useCallback((path: string) => {
    router.replace(path)
  }, [router])

  // Prefetch all routes
  useEffect(() => {
    navItems.forEach(item => {
      router.prefetch(item.path)
    })
  }, [navItems, router])

  return (
    <TooltipProvider>
      <nav className="flex items-center space-x-6 overflow-x-auto pb-1 hide-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`relative nav-link ${active ? "active" : ""}`}
                >
                  <motion.span 
                    whileHover={{ y: -2 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    {item.label}
                  </motion.span>
                  {active && (
                    <motion.div
                      className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-[#3b82f6]"
                      layoutId="activeNavIndicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
