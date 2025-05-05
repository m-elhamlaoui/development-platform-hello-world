"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export function AppHeader({ title }) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#1A2634] border-b border-gray-700 px-4 py-3 flex items-center">
      <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <Link href="/" className="text-xl font-bold">
        Orbital
      </Link>
      <nav className="ml-10 hidden md:block">
        <ul className="flex space-x-6">
          <li>
            <Link
              href="/"
              className={`hover:text-blue-400 transition-colors ${
                title === "Satellites" ? "text-white" : "text-gray-400"
              }`}
            >
              Satellites
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className={`hover:text-blue-400 transition-colors ${
                title === "Dashboard" ? "text-white" : "text-gray-400"
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/collision-detection"
              className={`hover:text-blue-400 transition-colors ${
                title === "Collision Detection" ? "text-white" : "text-gray-400"
              }`}
            >
              Collision Detection
            </Link>
          </li>
          <li>
            <Link
              href="/health-monitoring"
              className={`hover:text-blue-400 transition-colors ${
                title === "Health Monitoring" ? "text-white" : "text-gray-400"
              }`}
            >
              Health Monitoring
            </Link>
          </li>
          <li>
            <Link
              href="/pollution-tracking"
              className={`hover:text-blue-400 transition-colors ${
                title === "Pollution Tracking" ? "text-white" : "text-gray-400"
              }`}
            >
              Pollution Tracking
            </Link>
          </li>
          <li>
            <Link
              href="/end-of-life"
              className={`hover:text-blue-400 transition-colors ${
                title === "End of Life" ? "text-white" : "text-gray-400"
              }`}
            >
              End of Life
            </Link>
          </li>
        </ul>
      </nav>
      <div className="ml-auto">
        <Link href="/login">
          <Button variant="outline" className="mr-2">
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button>Sign Up</Button>
        </Link>
      </div>
    </header>
  )
}
