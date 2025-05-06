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
  Share2,
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
import { mockCollisionData } from "@/lib/mock-collision-data"
import { Progress } from "@/components/ui/progress"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { toast } from "@/components/ui/use-toast"
import { SatelliteOrbitVisualization } from "@/components/satellite-orbit-visualization"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CollisionDetectionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [viewMode, setViewMode] = useState("table")
  const [timeRange, setTimeRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedCollision, setSelectedCollision] = useState(null)
  const [showVisualization, setShowVisualization] = useState(false)
  const [criticalCount, setCriticalCount] = useState(2)
  const [warningCount, setWarningCount] = useState(5)
  const [lowRiskCount, setLowRiskCount] = useState(17)

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return

    const interval = setInterval(() => {
      setLastUpdated(new Date())

      // Randomly update counts to simulate changing data
      if (Math.random() > 0.7) {
        const change = Math.random() > 0.5 ? 1 : -1
        if (Math.random() > 0.7) {
          setCriticalCount((prev) => Math.max(0, prev + change))
        } else if (Math.random() > 0.5) {
          setWarningCount((prev) => Math.max(0, prev + change))
        } else {
          setLowRiskCount((prev) => Math.max(0, prev + change))
        }
      }

      toast({
        title: "Data Updated",
        description: "Collision prediction data has been refreshed",
        duration: 2000,
      })
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [realTimeUpdates])

  const handleRefresh = () => {
    setLastUpdated(new Date())
    toast({
      title: "Data Refreshed",
      description: "Latest collision prediction data has been loaded.",
    })
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setRiskFilter("all")
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    })
  }

  const handleCollisionSelect = (collision) => {
    setSelectedCollision(collision)
    setShowVisualization(true)
  }

  const handleCloseVisualization = () => {
    setShowVisualization(false)
  }

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Collision prediction data is being exported to CSV.",
    })
  }

  const handleShareReport = () => {
    toast({
      title: "Report Shared",
      description: "Collision prediction report has been shared with your team.",
    })
  }

  // Filter collision data based on search and risk filter
  const filteredCollisions = mockCollisionData.filter((collision) => {
    const matchesSearch =
      collision.primaryObject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collision.secondaryObject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = riskFilter === "all" || collision.riskLevel.toLowerCase() === riskFilter.toLowerCase()
    return matchesSearch && matchesRisk
  })

  // Calculate total events
  const totalEvents = criticalCount + warningCount + lowRiskCount

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
                <span>{lastUpdated.toLocaleTimeString()}</span>
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
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleShareReport}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share report</TooltipContent>
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
                <Badge variant="warning">Caution</Badge>
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
              <CardTitle className="text-sm font-medium">Monitored Objects</CardTitle>
              <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
                <Satellite className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400 glow-text-blue">1,248</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Active satellites</span>
                  <span>86</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Debris objects</span>
                  <span>1,162</span>
                </div>
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
              <CollisionChart />
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
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="flex items-center justify-start">
                    <Bell className="h-3.5 w-3.5 mr-2" />
                    <span>Alerts</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center justify-start">
                    <Rocket className="h-3.5 w-3.5 mr-2" />
                    <span>Maneuvers</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center justify-start">
                    <BarChart4 className="h-3.5 w-3.5 mr-2" />
                    <span>Reports</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center justify-start">
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
              <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800">
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
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
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
                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                              <ArrowDownUp className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>Primary Object</TableHead>
                        <TableHead>Secondary Object</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Time to Closest Approach
                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                              <ArrowDownUp className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Miss Distance
                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                              <ArrowDownUp className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Probability
                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                              <ArrowDownUp className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCollisions.length > 0 ? (
                        filteredCollisions.map((collision) => (
                          <TableRow key={collision.id} className="group">
                            <TableCell>
                              <Badge
                                variant={
                                  collision.riskLevel === "High"
                                    ? "destructive"
                                    : collision.riskLevel === "Medium"
                                      ? "warning"
                                      : "outline"
                                }
                                className={collision.riskLevel === "High" ? "animate-pulse" : ""}
                              >
                                {collision.riskLevel}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{collision.primaryObject}</TableCell>
                            <TableCell>{collision.secondaryObject}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{collision.timeToClosestApproach}</span>
                              </div>
                            </TableCell>
                            <TableCell>{collision.missDistance}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{collision.probability}</span>
                                {Number.parseFloat(collision.probability) > 0.01 && (
                                  <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                                )}
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
                    Showing <strong>{filteredCollisions.length}</strong> of <strong>24</strong> results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled className="rounded-full">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Next
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="cards" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCollisions.length > 0 ? (
                  filteredCollisions.slice(0, 6).map((collision) => (
                    <Card
                      key={collision.id}
                      className={`overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ${
                        collision.riskLevel === "High"
                          ? "border-red-200 dark:border-red-900/50"
                          : collision.riskLevel === "Medium"
                            ? "border-yellow-200 dark:border-yellow-900/50"
                            : ""
                      }`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="line-clamp-1 text-base">{collision.primaryObject}</CardTitle>
                            <CardDescription className="line-clamp-1">vs {collision.secondaryObject}</CardDescription>
                          </div>
                          <Badge
                            variant={
                              collision.riskLevel === "High"
                                ? "destructive"
                                : collision.riskLevel === "Medium"
                                  ? "warning"
                                  : "outline"
                            }
                            className={`${collision.riskLevel === "High" ? "animate-pulse" : ""}`}
                          >
                            {collision.riskLevel}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-3 p-4 pt-2 text-sm">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <div className="text-xs text-muted-foreground">Time to CA</div>
                          <div className="font-medium">{collision.timeToClosestApproach}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <div className="text-xs text-muted-foreground">Miss Distance</div>
                          <div className="font-medium">{collision.missDistance}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <div className="text-xs text-muted-foreground">Probability</div>
                          <div className="font-medium">{collision.probability}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <div className="text-xs text-muted-foreground">Relative Velocity</div>
                          <div className="font-medium">{collision.relativeVelocity}</div>
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
                  ))
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
              {filteredCollisions.length > 6 && (
                <div className="mt-6 flex items-center justify-center">
                  <Button variant="outline" className="rounded-full px-6">
                    Load More
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
                    {selectedCollision.primaryObject} vs {selectedCollision.secondaryObject}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>{selectedCollision.primaryObject}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>{selectedCollision.secondaryObject}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">Miss distance: {selectedCollision.missDistance}</div>
                </div>
              </div>

              <div className="h-full">
                <SatelliteOrbitVisualization
                  position1={[300, 200, 100]}
                  position2={[400, 150, 200]}
                  distance={Number.parseFloat(selectedCollision.missDistance) || 125}
                  dangerLevel={selectedCollision.riskLevel.toUpperCase()}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
