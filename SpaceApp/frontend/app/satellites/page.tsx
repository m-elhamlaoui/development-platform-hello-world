"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Search, Plus, Minus, Navigation, Satellite, Rocket, Activity, Filter, X, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import EarthGlobe from "@/components/earth-globe"
import SatelliteModal from "@/components/satellite-modal"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { generateStars } from "@/lib/stars"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from '@/lib/auth-context'
import AddSatelliteModal from '@/components/add-satellite-modal'
import UserSatellites from '@/components/user-satellites'

// Generate stars once at module level
const initialStars = generateStars(200)

interface EarthGlobeRef {
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  toggleRotation: (rotate: boolean) => void
}

export default function SatellitesPage() {
  const { user } = useAuth()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(5)
  const [isAutoRotate, setIsAutoRotate] = useState(true)
  const globeRef = useRef<EarthGlobeRef>(null)

  const handleZoomIn = () => {
    if (zoomLevel > 3) {
      setZoomLevel(zoomLevel - 1)
      if (globeRef.current) {
        globeRef.current.zoomIn()
      }
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel < 10) {
      setZoomLevel(zoomLevel + 1)
      if (globeRef.current) {
        globeRef.current.zoomOut()
      }
    }
  }

  const handleResetView = () => {
    if (globeRef.current) {
      globeRef.current.resetView()
    }
    setZoomLevel(5)
  }

  const handleToggleRotation = () => {
    setIsAutoRotate(!isAutoRotate)
    if (globeRef.current) {
      globeRef.current.toggleRotation(!isAutoRotate)
    }
  }

  const handleAddSatellites = (satellites: any[]) => {
    toast({
      title: "Satellites Added",
      description: `Successfully added ${satellites.length} satellite(s) to track.`,
    })
  }

  // Memoize the star field
  const starField = (
    <div className="star-field">
      {initialStars.map((star, index) => (
        <div
          key={`star-${index}`}
          className={`star ${star.size}`}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0a101c] text-white overflow-hidden relative">
      {starField}
      <div className="flex flex-col w-full">
        {/* Header */}
        <header className="app-header border-b border-[#1e2a41]">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center mr-8">
              <motion.div
                className="w-8 h-8 bg-white rounded mr-2 flex items-center justify-center"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-4 h-4 bg-[#0a101c]"></div>
              </motion.div>
              <span className="font-bold text-lg gradient-text">Space Tracker</span>
            </Link>
            <MainNav />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Sidebar */}
          <motion.div
            className="w-80 border-r border-[#1e2a41] p-4 glass"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold fancy-title">My Satellites</h2>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-[#1a2234] hover:text-white transition-colors"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {user && <UserSatellites userEmail={user.email} />}
          </motion.div>

          {/* Main content area */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  className="hover:bg-[#1a2234]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomOut}
                  className="hover:bg-[#1a2234]"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleResetView}
                  className="hover:bg-[#1a2234]"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleRotation}
                  className={`hover:bg-[#1a2234] ${isAutoRotate ? 'text-[#3b82f6]' : ''}`}
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative h-[calc(100vh-12rem)] overflow-hidden rounded-lg">
              <EarthGlobe
                ref={globeRef}
                satellites={[]}
                onSatelliteClick={() => {}}
                zoom={zoomLevel}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Satellite Modal */}
      <AnimatePresence>
        {isAddModalOpen && user && (
          <AddSatelliteModal
            onClose={() => setIsAddModalOpen(false)}
            onAddSatellites={handleAddSatellites}
            userEmail={user.email}
            userId={user.email}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 