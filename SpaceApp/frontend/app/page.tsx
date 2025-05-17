"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Search, Plus, Minus, Navigation, Satellite, Rocket, Activity, Filter, X, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import EarthGlobe from "@/components/earth-globe"
import SatelliteModal from "@/components/satellite-modal"
import { satellites } from "@/lib/data"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { generateStars } from "@/lib/stars"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface Satellite {
  id: number;
  name: string;
  type: string;
  launchDate: string;
  altitude: string;
  orbitType: string;
  status: string;
  color: number;
  description: string;
}

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filteredSatellites, setFilteredSatellites] = useState(satellites)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null)
  const [zoom, setZoom] = useState(1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    const filtered = satellites.filter((satellite) => {
      const matchesSearch = satellite.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === "all" || satellite.type === filterType
      const matchesStatus = filterStatus === "all" || satellite.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
    setFilteredSatellites(filtered)
  }, [searchQuery, filterType, filterStatus, user, loading, router])

  const handleSatelliteClick = (satellite: Satellite) => {
    setSelectedSatellite(satellite)
    setIsModalOpen(true)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
    setSearchQuery("")
    setFilterType("all")
    setFilterStatus("all")
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0f1520] text-white">
      {/* Header */}
      <header className="app-header border-b border-[#1e2a41]">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center mr-8">
            <motion.div
              className="w-8 h-8 bg-white rounded mr-2 flex items-center justify-center"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-4 h-4 bg-[#0f1520]"></div>
            </motion.div>
            <span className="font-bold text-lg gradient-text">Orbital</span>
          </Link>
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold fancy-title">Satellite Tracker</h1>
          <p className="text-gray-400">Track and monitor your satellites in real-time</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Search & Filter</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search satellites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-[#1a2234] border-[#1e2a41] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Type</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-[#1a2234] border-[#1e2a41] text-white"
                      >
                        {filterType === "all" ? "All Types" : filterType}
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-[#1a2234] border-[#1e2a41]">
                      <DropdownMenuItem
                        className="text-white hover:bg-[#2a3244]"
                        onClick={() => setFilterType("all")}
                      >
                        All Types
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#1e2a41]" />
                      <DropdownMenuItem
                        className="text-white hover:bg-[#2a3244]"
                        onClick={() => setFilterType("communication")}
                      >
                        Communication
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-white hover:bg-[#2a3244]"
                        onClick={() => setFilterType("weather")}
                      >
                        Weather
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-white hover:bg-[#2a3244]"
                        onClick={() => setFilterType("navigation")}
                      >
                        Navigation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Status</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-[#1a2234] border-[#1e2a41] text-white"
                      >
                        {filterStatus === "all" ? "All Status" : filterStatus}
                        <Activity className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-[#1a2234] border-[#1e2a41]">
                      <DropdownMenuItem
                        className="text-white hover:bg-[#2a3244]"
                        onClick={() => setFilterStatus("all")}
                      >
                        All Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#1e2a41]" />
                      <DropdownMenuItem
                        className="text-white hover:bg-[#2a3244]"
                        onClick={() => setFilterStatus("active")}
                      >
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-white hover:bg-[#2a3244]"
                        onClick={() => setFilterStatus("inactive")}
                      >
                        Inactive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-white hover:bg-[#2a3244]"
                        onClick={() => setFilterStatus("maintenance")}
                      >
                        Maintenance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Satellite Map</h2>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={handleZoomOut}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Zoom Out</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={handleZoomIn}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Zoom In</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="relative h-[600px] overflow-hidden rounded-lg">
                <EarthGlobe
                  satellites={filteredSatellites}
                  onSatelliteClick={handleSatelliteClick}
                  zoom={zoom}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Satellite Modal */}
      <AnimatePresence>
        {isModalOpen && selectedSatellite && (
          <SatelliteModal
            satellite={selectedSatellite}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedSatellite(null)
            }}
            onViewDetails={() => {
              // Handle view details action
              console.log('View details for:', selectedSatellite)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
