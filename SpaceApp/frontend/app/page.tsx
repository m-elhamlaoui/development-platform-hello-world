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

export default function SatellitesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [filteredSatellites, setFilteredSatellites] = useState(satellites)
  const [activeSatellite, setActiveSatellite] = useState(null)
  const [stars, setStars] = useState([])
  const [zoomLevel, setZoomLevel] = useState(5)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [filterType, setFilterType] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAutoRotate, setIsAutoRotate] = useState(true)

  const globeRef = useRef(null)
  const searchInputRef = useRef(null)
  const sidebarRef = useRef(null)

  useEffect(() => {
    // Generate stars for background
    setStars(generateStars(200))

    // Filter satellites based on search query and filters
    let filtered = satellites

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (satellite) =>
          satellite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          satellite.type.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply type filter
    if (filterType !== "All") {
      filtered = filtered.filter((satellite) => satellite.type === filterType)
    }

    // Apply status filter
    if (filterStatus !== "All") {
      filtered = filtered.filter((satellite) => satellite.status === filterStatus)
    }

    setFilteredSatellites(filtered)
  }, [searchQuery, filterType, filterStatus])

  const handleSatelliteClick = (satellite) => {
    setSelectedSatellite(satellite)
    toast({
      title: "Satellite Selected",
      description: `Viewing details for ${satellite.name}`,
    })
  }

  const handleCloseModal = () => {
    setSelectedSatellite(null)
  }

  const handleSatelliteHover = (satellite) => {
    setActiveSatellite(satellite)
  }

  const handleZoomIn = () => {
    if (zoomLevel > 3) {
      setZoomLevel(zoomLevel - 1)
      if (globeRef.current) {
        globeRef.current.zoomIn()
      }
      toast({
        title: "Zooming In",
        description: "Getting a closer look at the satellites",
        duration: 1500,
      })
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel < 10) {
      setZoomLevel(zoomLevel + 1)
      if (globeRef.current) {
        globeRef.current.zoomOut()
      }
      toast({
        title: "Zooming Out",
        description: "Viewing more of the Earth",
        duration: 1500,
      })
    }
  }

  const handleResetView = () => {
    if (globeRef.current) {
      globeRef.current.resetView()
    }
    setZoomLevel(5)
    toast({
      title: "View Reset",
      description: "Camera position has been reset",
      duration: 1500,
    })
  }

  const handleToggleRotation = () => {
    setIsAutoRotate(!isAutoRotate)
    if (globeRef.current) {
      globeRef.current.toggleRotation(!isAutoRotate)
    }
    toast({
      title: isAutoRotate ? "Rotation Stopped" : "Rotation Started",
      description: isAutoRotate ? "Earth rotation paused" : "Earth is now rotating",
      duration: 1500,
    })
  }

  const handleSearchClick = () => {
    setIsSearchExpanded(!isSearchExpanded)
    if (!isSearchExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery("")
    }
  }

  const handleFilterToggle = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handleFilterReset = () => {
    setFilterType("All")
    setFilterStatus("All")
    toast({
      title: "Filters Reset",
      description: "Showing all satellites",
      duration: 1500,
    })
  }

  const handleViewDetails = (satellite) => {
    // Navigate to detailed view
    toast({
      title: "Navigating",
      description: `Opening detailed view for ${satellite.name}`,
    })
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-[#0a101c] text-white overflow-hidden relative">
        {/* Star field background */}
        <div className="star-field">
          {stars.map((star, index) => (
            <div
              key={index}
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
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="relative"
                    >
                      <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search satellites..."
                        className="fancy-input pr-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a2234] text-gray-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSearchClick}
                    >
                      {isSearchExpanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>{isSearchExpanded ? "Close search" : "Search satellites"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${isFilterOpen ? "bg-[#3b82f6] text-white" : "bg-[#1a2234] text-gray-400 hover:text-white"} transition-colors`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFilterToggle}
                    >
                      <Filter className="h-4 w-4" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>Filter satellites</TooltipContent>
                </Tooltip>

                <UserNav />
              </div>
            </div>
          </header>

          {/* Main content */}
          <div className="flex flex-1">
            {/* Sidebar */}
            <motion.div
              ref={sidebarRef}
              className="w-80 border-r border-[#1e2a41] p-4 glass"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold fancy-title">Satellites</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a2234] text-gray-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        toast({
                          title: "Add Satellite",
                          description: "Feature coming soon!",
                        })
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>Add new satellite</TooltipContent>
                </Tooltip>
              </div>

              {/* Filter panel */}
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    className="mb-4 p-3 rounded-lg bg-[#1a2234] border border-[#1e2a41]"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={handleFilterReset} className="h-7 px-2 text-xs">
                        Reset
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-400">Type</label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between mt-1">
                              {filterType}
                              <Filter className="h-3 w-3 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setFilterType("All")}>All</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilterType("Weather Satellite")}>
                              Weather Satellite
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType("Space Station")}>
                              Space Station
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType("Earth Observation")}>
                              Earth Observation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType("Communication")}>
                              Communication
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType("Navigation")}>Navigation</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType("Space Telescope")}>
                              Space Telescope
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400">Status</label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between mt-1">
                              {filterStatus}
                              <Filter className="h-3 w-3 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setFilterStatus("All")}>All</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilterStatus("Active")}>Active</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterStatus("Inactive")}>Inactive</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for a satellite"
                  className="pl-9 bg-[#131c2e] border-[#1e2a41] text-white fancy-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {filteredSatellites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Satellite className="h-12 w-12 text-gray-500 mb-3" />
                  <p className="text-gray-400">No satellites found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={handleFilterReset}>
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 overflow-auto max-h-[calc(100vh-12rem)]">
                  <AnimatePresence>
                    {filteredSatellites.map((satellite, index) => (
                      <motion.button
                        key={satellite.id}
                        className={`satellite-item flex items-center w-full p-3 rounded-lg transition-colors text-left ${activeSatellite?.id === satellite.id ? "active" : ""}`}
                        onClick={() => handleSatelliteClick(satellite)}
                        onMouseEnter={() => handleSatelliteHover(satellite)}
                        onMouseLeave={() => handleSatelliteHover(null)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="satellite-image w-12 h-12 rounded-lg bg-[#131c2e] mr-3 flex items-center justify-center overflow-hidden">
                          {satellite.type === "Weather Satellite" && <Satellite className="h-6 w-6 text-blue-400" />}
                          {satellite.type === "Space Station" && <Rocket className="h-6 w-6 text-red-400" />}
                          {satellite.type === "Earth Observation" && <Activity className="h-6 w-6 text-green-400" />}
                          {satellite.type === "Communication" && <Satellite className="h-6 w-6 text-yellow-400" />}
                          {satellite.type === "Navigation" && <Navigation className="h-6 w-6 text-purple-400" />}
                          {satellite.type === "Space Telescope" && <Satellite className="h-6 w-6 text-indigo-400" />}
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            <span
                              className={`status-indicator ${satellite.status === "Active" ? "status-active" : "status-inactive"}`}
                            ></span>
                            {satellite.name}
                          </div>
                          <div className="text-sm text-gray-400">{satellite.type}</div>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Main content area */}
            <div className="flex-1 relative">
              <div className="absolute inset-0">
                <EarthGlobe
                  ref={globeRef}
                  satellites={filteredSatellites}
                  onSatelliteClick={handleSatelliteClick}
                  activeSatellite={activeSatellite}
                  zoomLevel={zoomLevel}
                />
              </div>

              {/* Controls */}
              <motion.div
                className="absolute right-4 bottom-4 flex flex-col space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className="earth-control-button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleZoomIn}
                    >
                      <Plus className="h-5 w-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Zoom in</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className="earth-control-button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleZoomOut}
                    >
                      <Minus className="h-5 w-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Zoom out</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className="earth-control-button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResetView}
                    >
                      <Navigation className="h-5 w-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Reset view</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className={`earth-control-button ${isAutoRotate ? "border-blue-500" : ""}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleToggleRotation}
                    >
                      <RotateCcw className="h-5 w-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="left">{isAutoRotate ? "Stop rotation" : "Start rotation"}</TooltipContent>
                </Tooltip>
              </motion.div>

              {/* Satellite info panel */}
              <AnimatePresence>
                {activeSatellite && (
                  <motion.div
                    className="satellite-info-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-bold mb-1">{activeSatellite.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{activeSatellite.type}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Altitude:</span>
                        <p>{activeSatellite.altitude}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Orbit:</span>
                        <p>{activeSatellite.orbitType}</p>
                      </div>
                    </div>
                    <Button className="w-full mt-3 fancy-button" onClick={() => handleSatelliteClick(activeSatellite)}>
                      View Details
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Satellite Modal */}
        <AnimatePresence>
          {selectedSatellite && (
            <SatelliteModal
              satellite={selectedSatellite}
              onClose={handleCloseModal}
              onViewDetails={() => handleViewDetails(selectedSatellite)}
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
