"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
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
import { useAuth } from '@/lib/auth-context'
import AddSatelliteModal from '@/components/add-satellite-modal'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import Cookies from 'js-cookie'
import React from 'react'

// Configure axios retry
axiosRetry(axios, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
  }
});

// Generate stars once at module level
const initialStars = generateStars(200)

// Cache for storing satellite data
const satelliteCache = new Map<string, { data: any[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Add localStorage key
const STORAGE_KEY = 'satellite_data'

interface EarthGlobeRef {
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  toggleRotation: (rotate: boolean) => void
}

interface Satellite {
  id: string
  name: string
  norad_id: number
  launchDate: string
  launchSite: string
  popular: string
  owner: string
  type?: string
  status?: string
  altitude?: string
  orbitType?: string
}

export default React.memo(function SatellitesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null)
  const [activeSatellite, setActiveSatellite] = useState<Satellite | null>(null)
  const [zoomLevel, setZoomLevel] = useState(5)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [filterType, setFilterType] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterOwner, setFilterOwner] = useState("All")
  const [filterOrbitType, setFilterOrbitType] = useState("All")
  const [filterLaunchSite, setFilterLaunchSite] = useState("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAutoRotate, setIsAutoRotate] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [satellites, setSatellites] = useState<Satellite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const globeRef = useRef<EarthGlobeRef>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Add debugging for user state
  useEffect(() => {
    const token = Cookies.get('token');
    console.log('Auth state:', {
      user,
      isAuthenticated: !!user,
      userEmail: user?.email,
      token: token
    });

    // If we have a token but no user, try to fetch user data
    if (token && !user) {
      console.log('Token exists but no user, fetching user data...');
      fetchUserData(token);
    }
  }, [user]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('User data fetched:', response.data);
      // You'll need to update your auth context with this data
      // This depends on how your auth context is implemented
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If the token is invalid, clear it and redirect to login
      Cookies.remove('token');
      router.push('/login');
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
    }
  }, [router]);

  // Add function to save satellites to localStorage
  const saveSatellitesToStorage = useCallback((satellites: Satellite[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(satellites));
    } catch (error) {
      console.error('Error saving satellites to storage:', error);
    }
  }, []);

  // Add function to load satellites from localStorage
  const loadSatellitesFromStorage = useCallback(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setSatellites(parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading satellites from storage:', error);
    }
    return null;
  }, []);

  // Modify fetchTrackedSatellites to use localStorage
  const fetchTrackedSatellites = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      console.log('No token found in fetchTrackedSatellites');
      // Try to load from localStorage if no token
      const storedSatellites = loadSatellitesFromStorage();
      if (storedSatellites) {
        setSatellites(storedSatellites);
      }
      return;
    }
    
    try {
      console.log('Fetching satellites with token');
      setLoading(true);
      setError(null);

      // Get user email from token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userEmail = tokenData.sub;
      console.log('User email from token:', userEmail);

      // Check cache first
      const cachedData = satelliteCache.get(userEmail);
      const now = Date.now();
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        console.log('Using cached data');
        setSatellites(prev => {
          // Only update if the data is different
          if (JSON.stringify(prev) !== JSON.stringify(cachedData.data)) {
            saveSatellitesToStorage(cachedData.data);
            return cachedData.data;
          }
          return prev;
        });
        setLoading(false);
        return;
      }
      
      // Fix the API endpoint URL
      const response = await axios.get(`http://localhost:8080/api/v1/users/stallitesTrackeByUser/${userEmail}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000,
      });
      
      console.log('API Response:', response.data);
      const data = response.data;
      
      // Map the API data to include static values for visualization
      const mappedSatellites = data.map((satellite: any) => ({
        ...satellite,
        type: "Earth Observation",
        status: "Active",
        altitude: "400 km",
        orbitType: "Low Earth Orbit",
      }));
      
      console.log('Mapped satellites:', mappedSatellites);
      
      // Update cache and localStorage
      satelliteCache.set(userEmail, {
        data: mappedSatellites,
        timestamp: now
      });
      saveSatellitesToStorage(mappedSatellites);
      
      // Only update if the data is different
      setSatellites(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(mappedSatellites)) {
          return mappedSatellites;
        }
        return prev;
      });
    } catch (err) {
      console.error('Error details:', err);
      // Try to load from localStorage on error
      const storedSatellites = loadSatellitesFromStorage();
      if (storedSatellites) {
        setSatellites(storedSatellites);
      }
      
      if (axios.isAxiosError(err)) {
        console.error('Axios error:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
        if (err.code === 'ECONNABORTED' || err.name === 'AbortError') {
          setError("Request timed out. Please try again.");
        } else if (err.response?.status === 404) {
          setSatellites([]);
          setError("No satellites found for this user");
        } else {
          setError(err.response?.data?.error || "Failed to load tracked satellites");
        }
      } else {
        setError("An unexpected error occurred");
      }
      
      toast({
        title: "Error",
        description: error || "Failed to load tracked satellites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [loadSatellitesFromStorage, saveSatellitesToStorage]);

  // Add useEffect to fetch satellites when component mounts
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      fetchTrackedSatellites();
    }
  }, [fetchTrackedSatellites]);

  // Load satellites from localStorage on initial mount
  useEffect(() => {
    const storedSatellites = loadSatellitesFromStorage();
    if (storedSatellites) {
      setSatellites(storedSatellites);
    }
  }, [loadSatellitesFromStorage]);

  // Compute unique values for key filter fields
  const availableTypes = useMemo(() => Array.from(new Set(satellites.map(s => s.type).filter(Boolean))), [satellites]);
  const availableStatuses = useMemo(() => Array.from(new Set(satellites.map(s => s.status).filter(Boolean))), [satellites]);
  const availableOwners = useMemo(() => Array.from(new Set(satellites.map(s => s.owner).filter(Boolean))), [satellites]);
  const availableOrbitTypes = useMemo(() => Array.from(new Set(satellites.map(s => s.orbitType).filter(Boolean))), [satellites]);
  const availableLaunchSites = useMemo(() => Array.from(new Set(satellites.map(s => s.launchSite).filter(Boolean))), [satellites]);

  // Memoize filtered satellites
  const filteredSatellites = useMemo(() => {
    let filtered = satellites

    if (searchQuery) {
      filtered = filtered.filter(
        (satellite) =>
          satellite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (satellite.type && satellite.type.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (filterOwner !== "All") {
      filtered = filtered.filter((satellite) => satellite.owner === filterOwner)
    }

    if (filterOrbitType !== "All") {
      filtered = filtered.filter((satellite) => satellite.orbitType === filterOrbitType)
    }

    if (filterLaunchSite !== "All") {
      filtered = filtered.filter((satellite) => satellite.launchSite === filterLaunchSite)
    }

    return filtered
  }, [satellites, searchQuery, filterOwner, filterOrbitType, filterLaunchSite])

  // Memoize the star field
  const starField = useMemo(() => (
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
  ), [])

  const memoizedFilteredSatellites = useMemo(() => filteredSatellites, [filteredSatellites]);

  // Memoize handlers
  const handleSatelliteClick = useCallback((satellite: Satellite) => {
    setSelectedSatellite(satellite)
    toast({
      title: "Satellite Selected",
      description: `Viewing details for ${satellite.name}`,
    })
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedSatellite(null)
  }, [])

  const handleSatelliteHover = useCallback((satellite: Satellite | null) => {
    setActiveSatellite(satellite)
  }, [])

  const handleZoomIn = useCallback(() => {
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
  }, [zoomLevel])

  const handleZoomOut = useCallback(() => {
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
  }, [zoomLevel])

  const handleResetView = useCallback(() => {
    if (globeRef.current) {
      globeRef.current.resetView()
    }
    setZoomLevel(5)
    toast({
      title: "View Reset",
      description: "Camera position has been reset",
      duration: 1500,
    })
  }, [])

  const handleToggleRotation = useCallback(() => {
    setIsAutoRotate(!isAutoRotate)
    if (globeRef.current) {
      globeRef.current.toggleRotation(!isAutoRotate)
    }
    toast({
      title: isAutoRotate ? "Rotation Stopped" : "Rotation Started",
      description: isAutoRotate ? "Earth rotation paused" : "Earth is now rotating",
      duration: 1500,
    })
  }, [isAutoRotate])

  const handleSearchClick = useCallback(() => {
    setIsSearchExpanded(!isSearchExpanded)
    if (!isSearchExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery("")
    }
  }, [isSearchExpanded])

  const handleFilterToggle = useCallback(() => {
    setIsFilterOpen(!isFilterOpen)
  }, [isFilterOpen])

  const handleFilterReset = useCallback(() => {
    setFilterOwner("All")
    setFilterOrbitType("All")
    setFilterLaunchSite("All")
    toast({
      title: "Filters Reset",
      description: "Showing all satellites",
      duration: 1500,
    })
  }, [])

  const handleViewDetails = useCallback((satellite: Satellite) => {
    toast({
      title: "Navigating",
      description: `Opening detailed view for ${satellite.name}`,
    })
  }, [])

  const handleAddSatellites = useCallback((newSatellites: Satellite[]) => {
    setSatellites(prev => {
      // Filter out any duplicates
      const existingIds = new Set(prev.map(s => s.id));
      const uniqueNewSatellites = newSatellites.filter(s => !existingIds.has(s.id));
      return [...prev, ...uniqueNewSatellites];
    });
    toast({
      title: "Success",
      description: `Added ${newSatellites.length} satellite(s) to track`,
    });
  }, []);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-[#0a101c] text-white overflow-hidden relative" key="satellites-page">
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
                <h2 className="text-2xl font-bold fancy-title">Tracked Satellites</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a2234] text-gray-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAddModalOpen(true)}
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
                        <label className="text-xs text-gray-400">Owner</label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between mt-1">
                              {filterOwner}
                              <Filter className="h-3 w-3 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setFilterOwner("All")}>All</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {availableOwners.map(owner => owner && (
                              <DropdownMenuItem key={owner} onClick={() => setFilterOwner(owner)}>{owner}</DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400">Orbit Type</label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between mt-1">
                              {filterOrbitType}
                              <Filter className="h-3 w-3 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setFilterOrbitType("All")}>All</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {availableOrbitTypes.map(orbitType => orbitType && (
                              <DropdownMenuItem key={orbitType} onClick={() => setFilterOrbitType(orbitType)}>{orbitType}</DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400">Launch Site</label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between mt-1">
                              {filterLaunchSite}
                              <Filter className="h-3 w-3 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setFilterLaunchSite("All")}>All</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {availableLaunchSites.map(site => site && (
                              <DropdownMenuItem key={site} onClick={() => setFilterLaunchSite(site)}>{site}</DropdownMenuItem>
                            ))}
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

              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6] mb-4"></div>
                  <p className="text-sm text-gray-400">Loading satellites...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Satellite className="h-12 w-12 text-gray-500 mb-3" />
                  <p className="text-gray-400">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={fetchTrackedSatellites}
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredSatellites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Satellite className="h-12 w-12 text-gray-500 mb-3" />
                  <p className="text-gray-400">No satellites found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adding some satellites to track</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Add Satellites
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
                          <Satellite className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            <span className="status-indicator status-active"></span>
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
                  satellites={memoizedFilteredSatellites}
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

        {/* Add Satellite Modal */}
        <AnimatePresence>
          {isAddModalOpen && user?.email && (
            <AddSatelliteModal
              onClose={() => setIsAddModalOpen(false)}
              onAddSatellites={handleAddSatellites}
              userEmail={user.email}
              userId={user.email}
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}) 