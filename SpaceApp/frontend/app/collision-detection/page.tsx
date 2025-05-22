"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  ArrowDownUp,
  Calendar,
  Clock,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  TrendingDown,
  Satellite,
  X,
  Download,
  BarChart4,
  Orbit,
  Rocket,
  Radar,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CollisionChart } from "@/components/collision-chart"
import { CollisionPredictionModal } from "@/components/collision-prediction-modal"
import { fetchUserCollisions, fetchCollisionStats, fetchCollisionTimeline, type CollisionAlert, type CollisionStats, type PaginatedResponse } from "@/lib/collision-service"
import { Progress } from "@/components/ui/progress"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { toast } from "@/components/ui/use-toast"
import { SatelliteOrbitVisualization } from "@/components/satellite-orbit-visualization"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, formatDistanceToNow, parseISO, getDayOfYear } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CollisionDetectionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [viewMode, setViewMode] = useState("table")
  const [timeRange, setTimeRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [selectedCollision, setSelectedCollision] = useState<CollisionAlert | null>(null)
  const [showVisualization, setShowVisualization] = useState(false)
  const [criticalCount, setCriticalCount] = useState(0)
  const [warningCount, setWarningCount] = useState(0)
  const [lowRiskCount, setLowRiskCount] = useState(0)
  const [collisions, setCollisions] = useState<CollisionAlert[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCollisions, setTotalCollisions] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'time',
    direction: 'asc'
  });
  const [timeRangeFilter, setTimeRangeFilter] = useState("all")
  const [distanceFilter, setDistanceFilter] = useState("all")
  const [trendFilter, setTrendFilter] = useState("all")
  const [activeAction, setActiveAction] = useState<string | null>(null)

  // Update time display on client-side only
  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Load data function
  const loadData = async (page = 1, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      const [collisionResponse, stats] = await Promise.all([
        fetchUserCollisions(page, pageSize),
        fetchCollisionStats()
      ])
      
      setCollisions(prev => append ? [...prev, ...collisionResponse.data] : collisionResponse.data)
      setTotalCollisions(collisionResponse.total)
      setHasMore(collisionResponse.hasMore)
      setCurrentPage(collisionResponse.page)
      
      setCriticalCount(stats.dangerLevels.critical)
      setWarningCount(stats.dangerLevels.high)
      setLowRiskCount(stats.dangerLevels.low + stats.dangerLevels.moderate)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load collision data'
      setError(errorMessage)
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Fetch initial data
  useEffect(() => {
    loadData()
  }, [])

  // Real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return

    const interval = setInterval(async () => {
      try {
        const [collisionResponse, stats] = await Promise.all([
          fetchUserCollisions(currentPage, pageSize),
          fetchCollisionStats()
        ])
        
        setCollisions(collisionResponse.data)
        setTotalCollisions(collisionResponse.total)
        setHasMore(collisionResponse.hasMore)
        
        setCriticalCount(stats.dangerLevels.critical)
        setWarningCount(stats.dangerLevels.high)
        setLowRiskCount(stats.dangerLevels.low + stats.dangerLevels.moderate)
        setError(null)

        toast({
          title: "Data Updated",
          description: "Collision prediction data has been refreshed",
          duration: 2000,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update collision data'
        setError(errorMessage)
        console.error('Error updating data:', err)
        
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        })
      }
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [realTimeUpdates, currentPage, pageSize])

  // Load more data function
  const handleLoadMore = async () => {
    if (hasMore) {
      setIsLoadingMore(true)
      try {
        const nextPage = currentPage + 1
        const response = await fetchUserCollisions(nextPage, pageSize)
        setCollisions(prev => [...prev, ...response.data])
        setCurrentPage(nextPage)
        setHasMore(response.hasMore)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load more data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingMore(false)
      }
    }
  }

  // Pagination handlers
  const handleNextPage = async () => {
    if (hasMore) {
      await loadData(currentPage + 1)
    }
  }

  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      await loadData(currentPage - 1)
    }
  }

  const handleRefresh = async () => {
    await loadData(currentPage)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setRiskFilter("all")
    setTimeRangeFilter("all")
    setDistanceFilter("all")
    setTrendFilter("all")
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    })
  }

  const handleCollisionSelect = (collision: CollisionAlert) => {
    setSelectedCollision(collision)
    setShowVisualization(true)
  }

  const handleCloseVisualization = () => {
    setShowVisualization(false)
  }

  const handleExportData = async () => {
    try {
      // Create CSV content
      const headers = ['ID', 'Primary Satellite', 'Secondary Satellite', 'Time', 'Distance (km)', 'Danger Level', 'Trend', 'Distance Trend']
      const csvContent = [
        headers.join(','),
        ...filteredCollisions.map(collision => [
          collision.id,
          collision.satellites[0],
          collision.satellites[1],
          collision.time,
          collision.distance_km,
          collision.danger_level,
          collision.trend,
          collision.distance_trend
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `collision-data-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: "Collision data has been exported to CSV",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export collision data",
        variant: "destructive",
      })
    }
  }

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    setActiveAction(action)
  }

  const handleCloseAction = () => {
    setActiveAction(null)
  }

  // Filter collision data based on all filters
  const filteredCollisions = (collisions || []).filter((collision) => {
    if (!collision || !collision.satellites || !Array.isArray(collision.satellites)) {
      return false;
    }

    // Search filter
    const matchesSearch =
      collision.satellites[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collision.satellites[1]?.toLowerCase().includes(searchQuery.toLowerCase());

    // Risk filter
    const matchesRisk = riskFilter === "all" || 
      (riskFilter === "critical" && collision.danger_level === "CRITICAL") ||
      (riskFilter === "high" && collision.danger_level === "HIGH") ||
      (riskFilter === "moderate" && collision.danger_level === "MODERATE") ||
      (riskFilter === "low" && collision.danger_level === "LOW");

    // Time range filter
    const collisionTime = new Date(collision.time).getTime();
    const now = new Date().getTime();
    const timeDiff = now - collisionTime;
    const matchesTimeRange = timeRangeFilter === "all" ||
      (timeRangeFilter === "last24h" && timeDiff <= 24 * 60 * 60 * 1000) ||
      (timeRangeFilter === "last7d" && timeDiff <= 7 * 24 * 60 * 60 * 1000) ||
      (timeRangeFilter === "last30d" && timeDiff <= 30 * 24 * 60 * 60 * 1000) ||
      (timeRangeFilter === "older" && timeDiff > 30 * 24 * 60 * 60 * 1000);

    // Distance filter
    const matchesDistance = distanceFilter === "all" ||
      (distanceFilter === "veryClose" && collision.distance_km <= 1) ||
      (distanceFilter === "close" && collision.distance_km > 1 && collision.distance_km <= 5) ||
      (distanceFilter === "medium" && collision.distance_km > 5 && collision.distance_km <= 10) ||
      (distanceFilter === "far" && collision.distance_km > 10);

    // Trend filter
    const matchesTrend = trendFilter === "all" ||
      (trendFilter === "increasing" && collision.trend.toLowerCase().includes("increasing")) ||
      (trendFilter === "decreasing" && collision.trend.toLowerCase().includes("decreasing")) ||
      (trendFilter === "stable" && collision.trend.toLowerCase().includes("stable"));

    return matchesSearch && matchesRisk && matchesTimeRange && matchesDistance && matchesTrend;
  });

  // Calculate total events
  const totalEvents = criticalCount + warningCount + lowRiskCount

  // Sort function to calculate time difference from now
  const getTimeDifference = (timeStr: string) => {
    const collisionTime = new Date(timeStr).getTime();
    const now = new Date().getTime();
    return Math.abs(collisionTime - now);
  };

  // Sorting function
  const sortCollisions = (collisions: CollisionAlert[]) => {
    if (!sortConfig) return collisions;

    return [...collisions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'time':
          // Sort by closest time to now
          aValue = getTimeDifference(a.time);
          bValue = getTimeDifference(b.time);
          break;
        case 'danger_level':
          const dangerOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MODERATE': 2, 'LOW': 3 };
          aValue = dangerOrder[a.danger_level as keyof typeof dangerOrder] ?? 4;
          bValue = dangerOrder[b.danger_level as keyof typeof dangerOrder] ?? 4;
          break;
        case 'primary_object':
          aValue = a.satellites[0];
          bValue = b.satellites[0];
          break;
        case 'secondary_object':
          aValue = a.satellites[1];
          bValue = b.satellites[1];
          break;
        case 'distance':
          aValue = a.distance_km;
          bValue = b.distance_km;
          break;
        case 'probability':
          aValue = a.trend;
          bValue = b.trend;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Sort handler
  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Apply sorting to filtered collisions
  const sortedCollisions = sortCollisions(filteredCollisions);

  // Format time display
  const formatTimeDisplay = (timeStr: string) => {
    const date = parseISO(timeStr);
    const now = new Date();
    const isPast = date < now;
    
    return {
      fullDate: format(date, 'yyyy-MM-dd HH:mm:ss'),
      relativeTime: formatDistanceToNow(date, { addSuffix: true }),
      year: format(date, 'yyyy'),
      dayOfYear: getDayOfYear(date),
      isPast
    };
  };

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
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute -left-1 -top-1 h-8 w-8 rounded-full bg-red-500/10 animate-pulse"></div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold fancy-title">Collision Detection</h1>
                <p className="text-gray-400 mt-1 max-w-2xl">
                  Real-time monitoring and management of potential satellite collision events.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">Last updated:</span>
                <span>{lastUpdated || "Loading..."}</span>
              </div>

              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleExportData}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export data</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleRefresh}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh data</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400 glow-text-red">{criticalCount}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
                  <span>High priority</span>
                </div>
                <Badge variant="destructive" className="animate-pulse">
                  Action Required
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Warning Alerts</CardTitle>
              <div className="rounded-full bg-yellow-100 p-1 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400 glow-text-yellow">{warningCount}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3 text-yellow-500" />
                  <span>Monitor closely</span>
                </div>
                <Badge variant="secondary">Caution</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Risk Events</CardTitle>
              <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/20">
                <Shield className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 glow-text-green">{lowRiskCount}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                  <span>Routine monitoring</span>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Safe
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Satellites</CardTitle>
              <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
                <Satellite className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400 glow-text-blue">86</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Currently monitored</span>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Collision Probability Timeline</CardTitle>
                  <CardDescription>Predicted collision events over time</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <CollisionChart timeRange={timeRange} />
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Current risk levels by category</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">Critical</span>
                    </div>
                    <span className="text-sm">{criticalCount}</span>
                  </div>
                  <Progress value={(criticalCount / totalEvents) * 100} className="h-2 bg-gray-700">
                    <div className="h-full bg-red-500 rounded-full"></div>
                  </Progress>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm">Warning</span>
                    </div>
                    <span className="text-sm">{warningCount}</span>
                  </div>
                  <Progress value={(warningCount / totalEvents) * 100} className="h-2 bg-gray-700">
                    <div className="h-full bg-yellow-500 rounded-full"></div>
                  </Progress>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Low Risk</span>
                    </div>
                    <span className="text-sm">{lowRiskCount}</span>
                  </div>
                  <Progress value={(lowRiskCount / totalEvents) * 100} className="h-2 bg-gray-700">
                    <div className="h-full bg-green-500 rounded-full"></div>
                  </Progress>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-start"
                    onClick={() => handleQuickAction('alerts')}
                  >
                    <Bell className="h-3.5 w-3.5 mr-2" />
                    <span>Alerts</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-start"
                    onClick={() => handleQuickAction('maneuvers')}
                  >
                    <Rocket className="h-3.5 w-3.5 mr-2" />
                    <span>Maneuvers</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-start"
                    onClick={() => handleQuickAction('reports')}
                  >
                    <BarChart4 className="h-3.5 w-3.5 mr-2" />
                    <span>Reports</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-start"
                    onClick={() => handleQuickAction('tracking')}
                  >
                    <Radar className="h-3.5 w-3.5 mr-2" />
                    <span>Tracking</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold fancy-title">Collision Predictions</h2>
              <Badge variant="secondary" className="ml-2 bg-slate-800 text-slate-200 border-slate-700">
                {filteredCollisions.length} events
              </Badge>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search satellites..."
                  className="w-full pl-8 sm:w-[200px] md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[130px] rounded-full">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="critical">Critical Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="moderate">Moderate Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                  <SelectTrigger className="w-[130px] rounded-full">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="last24h">Last 24 Hours</SelectItem>
                    <SelectItem value="last7d">Last 7 Days</SelectItem>
                    <SelectItem value="last30d">Last 30 Days</SelectItem>
                    <SelectItem value="older">Older Events</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                  <SelectTrigger className="w-[130px] rounded-full">
                    <SelectValue placeholder="Distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Distances</SelectItem>
                    <SelectItem value="veryClose">Very Close (≤1 km)</SelectItem>
                    <SelectItem value="close">Close (1-5 km)</SelectItem>
                    <SelectItem value="medium">Medium (5-10 km)</SelectItem>
                    <SelectItem value="far">Far (&gt;10 km)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={trendFilter} onValueChange={setTrendFilter}>
                  <SelectTrigger className="w-[130px] rounded-full">
                    <SelectValue placeholder="Trend" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trends</SelectItem>
                    <SelectItem value="increasing">Increasing</SelectItem>
                    <SelectItem value="decreasing">Decreasing</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="cards">Card View</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <Switch id="realtime" checked={realTimeUpdates} onCheckedChange={setRealTimeUpdates} />
                <Label htmlFor="realtime" className="text-sm">
                  Real-time updates
                </Label>
              </div>
            </div>
            <TabsContent value="table" className="mt-4">
              <Card className="shadow-md">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-muted/50">
                        <TableHead className="w-[100px]">
                          <div className="flex items-center gap-1">
                            Risk Level
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-full"
                              onClick={() => handleSort('danger_level')}
                            >
                              <ArrowDownUp className={`h-3 w-3 ${sortConfig?.key === 'danger_level' ? 'text-primary' : ''}`} />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Primary Object
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-full"
                              onClick={() => handleSort('primary_object')}
                            >
                              <ArrowDownUp className={`h-3 w-3 ${sortConfig?.key === 'primary_object' ? 'text-primary' : ''}`} />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Secondary Object
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-full"
                              onClick={() => handleSort('secondary_object')}
                            >
                              <ArrowDownUp className={`h-3 w-3 ${sortConfig?.key === 'secondary_object' ? 'text-primary' : ''}`} />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Time to Closest Approach
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-full"
                              onClick={() => handleSort('time')}
                            >
                              <ArrowDownUp className={`h-3 w-3 ${sortConfig?.key === 'time' ? 'text-primary' : ''}`} />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Miss Distance
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-full"
                              onClick={() => handleSort('distance')}
                            >
                              <ArrowDownUp className={`h-3 w-3 ${sortConfig?.key === 'distance' ? 'text-primary' : ''}`} />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Trend Analysis
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-full"
                              onClick={() => handleSort('probability')}
                            >
                              <ArrowDownUp className={`h-3 w-3 ${sortConfig?.key === 'probability' ? 'text-primary' : ''}`} />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCollisions.length > 0 ? (
                        sortedCollisions.map((collision) => (
                          <TableRow key={collision.id} className="group">
                            <TableCell>
                              <Badge
                                variant={
                                  collision.danger_level === "CRITICAL"
                                    ? "destructive"
                                    : collision.danger_level === "HIGH"
                                      ? "secondary"
                                      : "outline"
                                }
                                className={collision.danger_level === "CRITICAL" ? "animate-pulse" : ""}
                              >
                                {collision.danger_level}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{collision.satellites[0]}</TableCell>
                            <TableCell>{collision.satellites[1]}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{formatTimeDisplay(collision.time).fullDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="h-5">
                                    {formatTimeDisplay(collision.time).relativeTime}
                                  </Badge>
                                  <span>Y:{formatTimeDisplay(collision.time).year}</span>
                                  <span>D:{formatTimeDisplay(collision.time).dayOfYear}</span>
                                  {formatTimeDisplay(collision.time).isPast && (
                                    <Badge variant="destructive" className="h-5">Past</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{collision.distance_km.toFixed(2)} km</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{collision.trend}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <TrendingDown className="h-3.5 w-3.5" />
                                  <span>{collision.distance_trend}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleCollisionSelect(collision)}
                                >
                                  <Orbit className="h-4 w-4" />
                                  <span className="sr-only">Visualize</span>
                                </Button>
                                <CollisionPredictionModal collision={collision} />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Search className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No collision events found</p>
                              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                              <Button variant="outline" size="sm" className="mt-4" onClick={handleResetFilters}>
                                Reset Filters
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t px-6 py-3">
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>{sortedCollisions.length}</strong> of <strong>{totalCollisions}</strong> results
                  </div>
                  {hasMore && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="cards" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedCollisions.length > 0 ? (
                  <>
                    {sortedCollisions.map((collision) => (
                      <Card
                        key={collision.id}
                        className={`overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ${
                          collision.danger_level === "CRITICAL"
                            ? "border-red-200 dark:border-red-900/50"
                            : collision.danger_level === "HIGH"
                              ? "border-yellow-200 dark:border-yellow-900/50"
                              : ""
                        }`}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="line-clamp-1 text-base">{collision.satellites[0]}</CardTitle>
                              <CardDescription className="line-clamp-1">vs {collision.satellites[1]}</CardDescription>
                            </div>
                            <Badge
                              variant={
                                collision.danger_level === "CRITICAL"
                                  ? "destructive"
                                  : collision.danger_level === "HIGH"
                                    ? "secondary"
                                    : "outline"
                              }
                              className={`${collision.danger_level === "CRITICAL" ? "animate-pulse" : ""}`}
                            >
                              {collision.danger_level}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3 p-4 pt-2 text-sm">
                          <div className="rounded-lg bg-muted/50 p-2">
                            <div className="text-xs text-muted-foreground">Time to CA</div>
                            <div className="font-medium">{formatTimeDisplay(collision.time).fullDate}</div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Badge variant="outline" className="h-5">
                                {formatTimeDisplay(collision.time).relativeTime}
                              </Badge>
                              <span>Y:{formatTimeDisplay(collision.time).year}</span>
                              <span>D:{formatTimeDisplay(collision.time).dayOfYear}</span>
                              {formatTimeDisplay(collision.time).isPast && (
                                <Badge variant="destructive" className="h-5">Past</Badge>
                              )}
                            </div>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2">
                            <div className="text-xs text-muted-foreground">Miss Distance</div>
                            <div className="font-medium">{collision.distance_km.toFixed(2)} km</div>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2">
                            <div className="text-xs text-muted-foreground">Trend</div>
                            <div className="font-medium">{collision.trend}</div>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2">
                            <div className="text-xs text-muted-foreground">Distance Trend</div>
                            <div className="font-medium">{collision.distance_trend}</div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t p-4 flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => handleCollisionSelect(collision)}
                          >
                            <Orbit className="h-4 w-4 mr-2" />
                            Visualize
                          </Button>
                          <CollisionPredictionModal collision={collision} buttonVariant="default" buttonClassName="h-8" />
                        </CardFooter>
                      </Card>
                    ))}
                  </>
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No collision events found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                    <Button variant="outline" className="mt-4" onClick={handleResetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
              {hasMore && (
                <div className="mt-6 flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    className="rounded-full px-6"
                    onClick={() => loadData(currentPage + 1, true)}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* 3D Visualization Modal */}
      <AnimatePresence>
        {showVisualization && selectedCollision && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-5xl h-[80vh] bg-[#0f1520] border border-[#1e2a41] rounded-lg overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="absolute top-4 right-4 z-10">
                <Button variant="outline" size="icon" onClick={handleCloseVisualization}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute top-4 left-4 z-10">
                <div className="bg-[#131c2e]/80 backdrop-blur-sm p-3 rounded-lg border border-[#1e2a41]">
                  <h3 className="text-lg font-bold mb-1">Orbital Visualization</h3>
                  <div className="text-sm text-gray-300 mb-2">
                    {selectedCollision.satellites[0]} vs {selectedCollision.satellites[1]}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>{selectedCollision.satellites[0]}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>{selectedCollision.satellites[1]}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">Miss distance: {selectedCollision.distance_km.toFixed(2)} km</div>
                </div>
              </div>

              <div className="h-full">
                <SatelliteOrbitVisualization
                  position1={[300, 200, 100]}
                  position2={[400, 150, 200]}
                  distance={selectedCollision.distance_km || 125}
                  dangerLevel={selectedCollision.danger_level.toUpperCase()}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Action Modals */}
      <Dialog open={activeAction === 'alerts'} onOpenChange={handleCloseAction}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Active Alerts</DialogTitle>
            <DialogDescription>Current collision alerts and warnings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {collisions.filter(c => c.danger_level === "CRITICAL" || c.danger_level === "HIGH").map(collision => (
              <Card key={collision.id} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{collision.satellites.join(" vs ")}</CardTitle>
                    <Badge variant="destructive">{collision.danger_level}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Time: {collision.time}</div>
                    <div>Distance: {collision.distance_km.toFixed(2)} km</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeAction === 'maneuvers'} onOpenChange={handleCloseAction}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Recommended Maneuvers</DialogTitle>
            <DialogDescription>Suggested orbital adjustments to prevent collisions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {collisions.filter(c => c.danger_level === "CRITICAL" || c.danger_level === "HIGH").map(collision => (
              <Card key={collision.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Maneuver for {collision.satellites[0]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Recommended Action:</span> Adjust orbit by 0.5 km
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Time Window:</span> {collision.time}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Expected Outcome:</span> Increase miss distance to 5 km
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeAction === 'reports'} onOpenChange={handleCloseAction}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Collision Reports</DialogTitle>
            <DialogDescription>Detailed analysis and statistics</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Critical Risk</span>
                    <span>{criticalCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Risk</span>
                    <span>{warningCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Risk</span>
                    <span>{lowRiskCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Collisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {collisions.slice(0, 5).map(collision => (
                    <div key={collision.id} className="text-sm">
                      {collision.satellites.join(" vs ")} - {collision.time}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeAction === 'tracking'} onOpenChange={handleCloseAction}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Real-time Tracking</DialogTitle>
            <DialogDescription>Current satellite positions and trajectories</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
            {collisions.map(collision => (
              <Card key={collision.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{collision.satellites.join(" vs ")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Primary Position</div>
                      <div className="text-sm font-mono">
                        X: {collision.position1_km[0].toFixed(2)} km<br />
                        Y: {collision.position1_km[1].toFixed(2)} km<br />
                        Z: {collision.position1_km[2].toFixed(2)} km
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Secondary Position</div>
                      <div className="text-sm font-mono">
                        X: {collision.position2_km[0].toFixed(2)} km<br />
                        Y: {collision.position2_km[1].toFixed(2)} km<br />
                        Z: {collision.position2_km[2].toFixed(2)} km
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
