"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Battery,
  Calendar,
  Clock,
  Download,
  Filter,
  Fuel,
  Info,
  Layers,
  LifeBuoy,
  Orbit,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Share2,
  Shield,
  Trash2,
  TrendingDown,
  Zap,
} from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { LineChart } from "@/components/line-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function EndOfLifePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedSatellite, setSelectedSatellite] = useState("GRACE-FO 1")
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [showRealTimeUpdates, setShowRealTimeUpdates] = useState(true)
  const [fuelLevel, setFuelLevel] = useState(8)

  // Simulate real-time updates
  useEffect(() => {
    if (!showRealTimeUpdates) return

    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // Randomly decrease fuel level slightly to simulate consumption
      setFuelLevel((prev) => Math.max(prev - Math.random() * 0.1, 0).toFixed(1))
    }, 30000)

    return () => clearInterval(interval)
  }, [showRealTimeUpdates])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsLoading(false)
    }, 1000)
  }

  const getStatusColor = (value, thresholds) => {
    if (value <= thresholds.critical) return "text-red-500"
    if (value <= thresholds.warning) return "text-amber-500"
    return "text-emerald-500"
  }

  const getFuelStatusColor = (value) => getStatusColor(value, { warning: 30, critical: 10 })
  const getBatteryStatusColor = (value) => getStatusColor(100 - value, { warning: 80, critical: 75 })

  const forecastData = {
    labels: ["2023", "2024", "2025", "2026", "2027", "2028"],
    datasets: [
      {
        label: "Fuel Level (%)",
        data: [25, 20, 15, 8, 2, 0],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
      },
      {
        label: "Battery Health (%)",
        data: [85, 82, 78, 75, 70, 65],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
      {
        label: "Orbital Altitude (normalized)",
        data: [100, 99.5, 98.8, 97.9, 96.5, 94.8],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
      },
    ],
  }

  const orbitDecayData = {
    labels: ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"],
    datasets: [
      {
        label: "Orbital Altitude (km)",
        data: [500, 498, 495, 490, 483, 470, 450, 420],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
      },
      {
        label: "Predicted (with uncertainty)",
        data: [500, 498, 495, 490, 483, 470, 450, 420],
        borderColor: "rgba(16, 185, 129, 0.3)",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        borderWidth: 1,
        borderDash: [5, 5],
        fill: {
          target: "+1",
          above: "rgba(16, 185, 129, 0.05)",
        },
      },
      {
        label: "Upper Bound",
        data: [500, 499, 497, 494, 490, 485, 475, 460],
        borderColor: "rgba(16, 185, 129, 0)",
        backgroundColor: "rgba(16, 185, 129, 0)",
      },
      {
        label: "Lower Bound",
        data: [500, 497, 493, 486, 476, 455, 425, 380],
        borderColor: "rgba(16, 185, 129, 0)",
        backgroundColor: "rgba(16, 185, 129, 0)",
      },
    ],
  }

  const alerts = [
    {
      id: 1,
      title: "Critical Fuel Level",
      description: "Fuel level below 10%. Initiate deorbit planning.",
      severity: "critical",
      timestamp: "2023-12-15T09:23:11",
    },
    {
      id: 2,
      title: "Battery Degradation Warning",
      description: "Battery degradation at 15%. Monitor closely.",
      severity: "warning",
      timestamp: "2023-12-14T14:45:22",
    },
    {
      id: 3,
      title: "Attitude Control Deviation",
      description: "Attitude control error increased to 0.05°.",
      severity: "warning",
      timestamp: "2023-12-13T11:12:45",
    },
    {
      id: 4,
      title: "Solar Panel Efficiency Update",
      description: "Solar panel efficiency at 90% of original output.",
      severity: "info",
      timestamp: "2023-12-10T08:30:15",
    },
  ]

  const disposalOptions = [
    {
      id: "deorbit",
      title: "Controlled Deorbit",
      description: "Sufficient fuel for controlled re-entry. Estimated timeline: Q2 2026.",
      feasibility: "Feasible",
      fuelRequired: "7%",
      recommendation: "Recommended",
      complianceNote: "Complies with 25-year rule for LEO satellites.",
      icon: Rocket,
    },
    {
      id: "graveyard",
      title: "Graveyard Orbit",
      description: "Transfer to higher altitude orbit. Requires 10% fuel for transfer.",
      feasibility: "Not Feasible",
      fuelRequired: "10%",
      recommendation: "Not Recommended",
      complianceNote: "Not applicable for LEO satellites.",
      icon: Orbit,
    },
    {
      id: "passivation",
      title: "Passivation",
      description: "Battery discharge and fuel venting possible after deorbit maneuver.",
      feasibility: "Feasible",
      fuelRequired: "N/A",
      recommendation: "Required",
      complianceNote: "Required by international guidelines.",
      icon: Battery,
    },
  ]

  const timelineEvents = [
    {
      date: "2023-01-01",
      event: "EOL Planning Initiated",
      description: "End-of-life planning process started.",
    },
    {
      date: "2023-12-15",
      event: "Critical Fuel Alert",
      description: "Fuel level dropped below 10% threshold.",
    },
    {
      date: "2024-06-01",
      event: "Deorbit Maneuver Planning",
      description: "Detailed planning for deorbit maneuver.",
    },
    {
      date: "2025-12-01",
      event: "Final Science Mission",
      description: "Completion of primary science objectives.",
    },
    {
      date: "2026-03-15",
      event: "Fuel Depletion",
      description: "Projected date for fuel depletion.",
    },
    {
      date: "2026-04-01",
      event: "Deorbit Maneuver",
      description: "Execution of controlled deorbit maneuver.",
    },
    {
      date: "2026-04-15",
      event: "Passivation",
      description: "Satellite passivation procedures.",
    },
    {
      date: "2026-05-01",
      event: "Re-entry",
      description: "Projected atmospheric re-entry date.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#0a101c] to-[#0f1520] text-white">
      {/* Header */}
      <header className="border-b border-[#1e2a41] bg-[#0a101c]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center mr-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-2 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Satellite Tracker
            </span>
          </Link>
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b border-[#1e2a41] bg-[#0a101c]/60 backdrop-blur-sm">
        <div className="px-4 py-2 text-sm flex items-center justify-between">
          <div>
            <Link href="/fleet" className="text-blue-400 hover:text-blue-300 transition-colors">
              Fleet
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span>End-of-Life Monitoring</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-blue-500/20 hover:text-blue-300 transition-all"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 rounded-full px-3 transition-all ${
                      showRealTimeUpdates
                        ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "text-gray-400 hover:bg-gray-500/20"
                    }`}
                    onClick={() => setShowRealTimeUpdates(!showRealTimeUpdates)}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    {showRealTimeUpdates ? "Real-time On" : "Real-time Off"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle real-time updates</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Satellite End-of-Life Monitoring
            </h1>
            <p className="text-gray-400 mt-1">
              Track satellite health, remaining operational life, and disposal options to plan safe and compliant
              end-of-life operations.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedSatellite} onValueChange={setSelectedSatellite}>
              <SelectTrigger className="w-[180px] bg-[#1a2234]/80 border-[#2d3a51] rounded-lg backdrop-blur-sm">
                <SelectValue placeholder="Select satellite" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2d3a51]">
                <SelectItem value="GRACE-FO 1">GRACE-FO 1</SelectItem>
                <SelectItem value="GRACE-FO 2">GRACE-FO 2</SelectItem>
                <SelectItem value="Landsat 9">Landsat 9</SelectItem>
                <SelectItem value="JPSS-1">JPSS-1</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg bg-[#1a2234]/80 border-[#2d3a51] hover:bg-[#2d3a51]/80 hover:border-blue-500/50 transition-all backdrop-blur-sm"
                >
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a2234] border-[#2d3a51]">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#2d3a51]" />
                <DropdownMenuItem>
                  <span>Show Critical Only</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Show Warnings Only</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Show All Metrics</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2d3a51]" />
                <DropdownMenuItem>
                  <span>Reset Filters</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all rounded-lg">
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </div>
        </div>

        {/* Satellite Info */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
            <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                Satellite Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="font-medium">{selectedSatellite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Launch Date:</span>
                  <span className="font-medium">May 22, 2018</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mission Type:</span>
                  <span className="font-medium">Earth Observation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Orbit:</span>
                  <span className="font-medium">Low Earth Orbit (LEO)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
            <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-400" />
                EOL Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Age:</span>
                  <span className="font-medium">5 years, 7 months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Design Lifetime:</span>
                  <span className="font-medium">5 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Extended Mission:</span>
                  <span className="font-medium">Approved until 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated EOL:</span>
                  <span className="font-medium text-amber-400">Q2 2026 (±3 months)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
            <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-blue-400" />
                EOL Status Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Overall Health:</span>
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-400 border-0 text-black font-medium">
                    Caution
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Critical Alerts:</span>
                  <span className="font-medium text-red-400">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Warnings:</span>
                  <span className="font-medium text-amber-400">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recommended Action:</span>
                  <span className="font-medium text-blue-400">Plan Deorbit</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alert */}
        <Alert className="mb-6 bg-gradient-to-r from-red-900/30 to-red-900/10 border-red-800/50 text-red-300 rounded-xl shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical: Fuel Level Below 10%</AlertTitle>
          <AlertDescription>
            Satellite has reached critical fuel level threshold. Initiate deorbit planning procedures according to
            protocol EOL-5A.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs defaultValue="metrics" className="mb-6">
          <TabsList className="bg-[#1a2234]/80 border border-[#2d3a51] rounded-lg p-1 backdrop-blur-sm">
            <TabsTrigger
              value="metrics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-md transition-all"
            >
              EOL Metrics
            </TabsTrigger>
            <TabsTrigger
              value="disposal"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-md transition-all"
            >
              Disposal Options
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-md transition-all"
            >
              Mission Timeline
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-md transition-all"
            >
              Alerts & Notifications
            </TabsTrigger>
          </TabsList>

          {/* EOL Metrics Tab */}
          <TabsContent value="metrics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Fuel Card */}
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-red-500/30 cursor-pointer group">
                    <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <Fuel className="h-5 w-5 mr-2 text-red-400 group-hover:text-red-300 transition-colors" />
                          Remaining Fuel
                        </div>
                        <Badge
                          className={`${
                            Number.parseFloat(fuelLevel) <= 10
                              ? "bg-gradient-to-r from-red-600 to-red-500"
                              : Number.parseFloat(fuelLevel) <= 30
                                ? "bg-gradient-to-r from-amber-600 to-amber-500"
                                : "bg-gradient-to-r from-emerald-600 to-emerald-500"
                          } border-0 text-white font-medium`}
                        >
                          {Number.parseFloat(fuelLevel) <= 10
                            ? "Critical"
                            : Number.parseFloat(fuelLevel) <= 30
                              ? "Warning"
                              : "Normal"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-4xl font-bold mb-2 flex items-center">
                        <span className={`${getFuelStatusColor(fuelLevel)} group-hover:scale-105 transition-transform`}>
                          {fuelLevel}%
                        </span>
                        <span className="text-sm font-normal text-gray-400 ml-2">of original capacity</span>
                      </div>
                      <Progress
                        value={fuelLevel}
                        max={100}
                        className={`h-2 mb-4 ${
                          Number.parseFloat(fuelLevel) <= 10
                            ? "bg-red-950/30"
                            : Number.parseFloat(fuelLevel) <= 30
                              ? "bg-amber-950/30"
                              : "bg-emerald-950/30"
                        }`}
                        style={{
                          backgroundImage:
                            Number.parseFloat(fuelLevel) <= 10
                              ? "linear-gradient(to right, #7f1d1d20, #7f1d1d10)"
                              : Number.parseFloat(fuelLevel) <= 30
                                ? "linear-gradient(to right, #78350f20, #78350f10)"
                                : "linear-gradient(to right, #064e3b20, #064e3b10)",
                        }}
                      />
                      <div className="text-sm text-gray-400 mb-2">Estimated depletion: Q2 2026</div>
                      <div className="h-20 mt-4">
                        <LineChart
                          data={{
                            labels: ["2023", "2024", "2025", "2026"],
                            datasets: [
                              {
                                label: "Fuel Level",
                                data: [25, 20, 15, 0],
                                borderColor: "#ef4444",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                              },
                            ],
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-[#1a2234] border-[#2d3a51] text-white max-w-3xl rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center">
                      <Fuel className="h-5 w-5 mr-2 text-red-400" />
                      Remaining Fuel Analysis
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Detailed analysis of fuel consumption and projections for {selectedSatellite}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#0f1520] p-3 rounded-lg border border-[#2d3a51]/50">
                        <div className="text-sm text-gray-400">Current Level</div>
                        <div className={`text-2xl font-bold ${getFuelStatusColor(fuelLevel)}`}>{fuelLevel}%</div>
                      </div>
                      <div className="bg-[#0f1520] p-3 rounded-lg border border-[#2d3a51]/50">
                        <div className="text-sm text-gray-400">Consumption Rate</div>
                        <div className="text-2xl font-bold">0.5% / month</div>
                      </div>
                      <div className="bg-[#0f1520] p-3 rounded-lg border border-[#2d3a51]/50">
                        <div className="text-sm text-gray-400">Depletion Date</div>
                        <div className="text-2xl font-bold">Apr 2026</div>
                      </div>
                    </div>

                    <div className="h-64 bg-[#0f1520] p-4 rounded-lg border border-[#2d3a51]/50">
                      <div className="text-sm text-gray-400 mb-2">Fuel Consumption Projection</div>
                      <LineChart
                        data={{
                          labels: ["2023", "2024", "2025", "2026", "2027"],
                          datasets: [
                            {
                              label: "Actual Fuel Level",
                              data: [25, 20, 15, 8, null],
                              borderColor: "#ef4444",
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              borderWidth: 2,
                            },
                            {
                              label: "Projected Fuel Level",
                              data: [null, null, null, 8, 0],
                              borderColor: "#ef4444",
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              borderWidth: 2,
                              borderDash: [5, 5],
                            },
                            {
                              label: "Upper Bound",
                              data: [25, 21, 17, 10, 3],
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              backgroundColor: "rgba(0, 0, 0, 0)",
                              borderWidth: 1,
                              borderDash: [2, 2],
                            },
                            {
                              label: "Lower Bound",
                              data: [25, 19, 13, 6, 0],
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              backgroundColor: "rgba(0, 0, 0, 0)",
                              borderWidth: 1,
                              borderDash: [2, 2],
                            },
                          ],
                        }}
                      />
                    </div>

                    <div className="bg-[#0f1520] p-4 rounded-lg border border-[#2d3a51]/50">
                      <h4 className="font-medium mb-2">Fuel Consumption Analysis</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        The satellite is consuming fuel at a rate of approximately 0.5% per month, primarily for orbit
                        maintenance and attitude control. Based on current consumption patterns, the fuel will be
                        depleted by April 2026 (±3 months).
                      </p>
                      <h4 className="font-medium mb-2 mt-4">Deorbit Fuel Requirements</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        A controlled deorbit maneuver requires approximately 7% fuel. With current levels at {fuelLevel}
                        %, there is sufficient fuel for a controlled deorbit if planned within the next 2-3 months.
                      </p>
                      <div className="flex items-center mt-4 text-amber-400 text-sm">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span>
                          Recommendation: Initiate deorbit planning immediately to ensure controlled re-entry.
                        </span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Last updated: {lastUpdated.toLocaleString()}</div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="bg-[#0f1520] border-[#2d3a51] hover:bg-[#1a2234] hover:border-[#3d4a61] transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
                        View Deorbit Plan
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Battery Card */}
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30 cursor-pointer group">
                    <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <Battery className="h-5 w-5 mr-2 text-blue-400 group-hover:text-blue-300 transition-colors" />
                          Battery Degradation
                        </div>
                        <Badge className="bg-gradient-to-r from-amber-600 to-amber-500 border-0 text-white font-medium">
                          Warning
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-4xl font-bold mb-2 flex items-center">
                        <span className={`${getBatteryStatusColor(15)} group-hover:scale-105 transition-transform`}>
                          15%
                        </span>
                        <span className="text-sm font-normal text-gray-400 ml-2">degraded</span>
                      </div>
                      <Progress
                        value={85}
                        max={100}
                        className="h-2 mb-4 bg-blue-950/30"
                        style={{
                          backgroundImage: "linear-gradient(to right, #1e3a8a20, #1e3a8a10)",
                        }}
                      />
                      <div className="text-sm text-gray-400 mb-2">Current capacity: 85% of original</div>
                      <div className="h-20 mt-4">
                        <LineChart
                          data={{
                            labels: ["2020", "2021", "2022", "2023"],
                            datasets: [
                              {
                                label: "Battery Health",
                                data: [100, 95, 90, 85],
                                borderColor: "#3b82f6",
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                              },
                            ],
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-[#1a2234] border-[#2d3a51] text-white max-w-3xl rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center">
                      <Battery className="h-5 w-5 mr-2 text-blue-400" />
                      Battery Degradation Analysis
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Detailed analysis of battery health and degradation for {selectedSatellite}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#0f1520] p-3 rounded-lg border border-[#2d3a51]/50">
                        <div className="text-sm text-gray-400">Current Capacity</div>
                        <div className="text-2xl font-bold">85%</div>
                      </div>
                      <div className="bg-[#0f1520] p-3 rounded-lg border border-[#2d3a51]/50">
                        <div className="text-sm text-gray-400">Degradation Rate</div>
                        <div className="text-2xl font-bold">3% / year</div>
                      </div>
                      <div className="bg-[#0f1520] p-3 rounded-lg border border-[#2d3a51]/50">
                        <div className="text-sm text-gray-400">Critical Threshold</div>
                        <div className="text-2xl font-bold">75%</div>
                      </div>
                    </div>

                    <div className="h-64 bg-[#0f1520] p-4 rounded-lg border border-[#2d3a51]/50">
                      <div className="text-sm text-gray-400 mb-2">Battery Health Projection</div>
                      <LineChart
                        data={{
                          labels: ["2020", "2021", "2022", "2023", "2024", "2025", "2026"],
                          datasets: [
                            {
                              label: "Actual Battery Health",
                              data: [100, 95, 90, 85, null, null, null],
                              borderColor: "#3b82f6",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                              borderWidth: 2,
                            },
                            {
                              label: "Projected Battery Health",
                              data: [null, null, null, 85, 82, 79, 76],
                              borderColor: "#3b82f6",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                              borderWidth: 2,
                              borderDash: [5, 5],
                            },
                          ],
                        }}
                      />
                    </div>

                    <div className="bg-[#0f1520] p-4 rounded-lg border border-[#2d3a51]/50">
                      <h4 className="font-medium mb-2">Battery Health Analysis</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        The satellite's battery has degraded to 85% of its original capacity over 5 years of operation.
                        This degradation rate of approximately 3% per year is within expected parameters for this
                        mission type.
                      </p>
                      <h4 className="font-medium mb-2 mt-4">Impact on Operations</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        Current battery capacity is sufficient for normal operations. The battery is projected to reach
                        the critical threshold of 75% by late 2026, which coincides with the planned end-of-life.
                      </p>
                      <div className="flex items-center mt-4 text-amber-400 text-sm">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Note: Battery degradation is not currently a limiting factor for mission extension.</span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Last updated: {lastUpdated.toLocaleString()}</div>
                    <Button
                      variant="outline"
                      className="bg-[#0f1520] border-[#2d3a51] hover:bg-[#1a2234] hover:border-[#3d4a61] transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Orbital Decay Card */}
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-emerald-500/30 cursor-pointer group">
                    <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingDown className="h-5 w-5 mr-2 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                          Orbital Decay
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 text-white font-medium">
                          Normal
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-4xl font-bold mb-2 flex items-center">
                        <span className="text-emerald-500 group-hover:scale-105 transition-transform">0.5</span>
                        <span className="text-sm font-normal text-gray-400 ml-2">km/year</span>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">Current altitude: 490 km</div>
                      <div className="text-sm text-gray-400 mb-2">Estimated re-entry: 2030 (without intervention)</div>
                      <div className="h-20 mt-4">
                        <LineChart
                          data={{
                            labels: ["2020", "2021", "2022", "2023"],
                            datasets: [
                              {
                                label: "Orbital Altitude",
                                data: [500, 499, 497.5, 496],
                                borderColor: "#10b981",
                                backgroundColor: "rgba(16, 185, 129, 0.1)",
                              },
                            ],
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-[#1a2234] border-[#2d3a51] text-white max-w-3xl rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center">
                      <TrendingDown className="h-5 w-5 mr-2 text-emerald-400" />
                      Orbital Decay Analysis
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Detailed analysis of orbital decay and re-entry projections for {selectedSatellite}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#0f1520] p-3 rounded-lg border border-[#2d3a51]/50">
                        <div className="text-sm text-gray-400">Current Altitude</div>
                        <div className="text-2xl font-bold">490 km</div>
                      </div>
                      <div className="bg-[#0f1520] p-3 rounded-lg border border-[#2d3a51]/50">
                        <div className="text-sm text-gray-400">Decay Rate</div>
                        <div className="text-2xl font-bold">0.5 km/year</div>
                      </div>
                      <div className="bg-[#0f1520] p-3 rounded-lg border border-[#2d3a51]/50">
                        <div className="text-sm text-gray-400">Natural Re-entry</div>
                        <div className="text-2xl font-bold">~2030</div>
                      </div>
                    </div>

                    <div className="h-64 bg-[#0f1520] p-4 rounded-lg border border-[#2d3a51]/50">
                      <div className="text-sm text-gray-400 mb-2">Orbital Altitude Projection</div>
                      <LineChart data={orbitDecayData} />
                    </div>

                    <div className="bg-[#0f1520] p-4 rounded-lg border border-[#2d3a51]/50">
                      <h4 className="font-medium mb-2">Orbital Decay Analysis</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        The satellite is experiencing a natural orbital decay rate of approximately 0.5 km/year due to
                        atmospheric drag. This rate is expected to increase as the satellite descends into denser
                        atmospheric layers.
                      </p>
                      <h4 className="font-medium mb-2 mt-4">Re-entry Projection</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        Without intervention, natural orbital decay would lead to atmospheric re-entry around 2030.
                        However, a controlled deorbit is recommended to ensure safe re-entry over unpopulated areas.
                      </p>
                      <div className="flex items-center mt-4 text-emerald-400 text-sm">
                        <Info className="h-4 w-4 mr-1" />
                        <span>
                          Note: Current orbital decay rate complies with the 25-year rule for post-mission disposal.
                        </span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Last updated: {lastUpdated.toLocaleString()}</div>
                    <Button
                      variant="outline"
                      className="bg-[#0f1520] border-[#2d3a51] hover:bg-[#1a2234] hover:border-[#3d4a61] transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Component Wear Card */}
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-blue-400" />
                      Component Wear
                    </div>
                    <Badge className="bg-gradient-to-r from-amber-600 to-amber-500 border-0 text-white font-medium">
                      Warning
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Attitude Control Error</span>
                        <span className="text-amber-400">0.05°</span>
                      </div>
                      <Progress
                        value={50}
                        max={100}
                        className="h-1 bg-amber-950/30"
                        style={{
                          backgroundImage: "linear-gradient(to right, #78350f20, #78350f10)",
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Solar Panel Efficiency</span>
                        <span className="text-emerald-400">90%</span>
                      </div>
                      <Progress
                        value={90}
                        max={100}
                        className="h-1 bg-emerald-950/30"
                        style={{
                          backgroundImage: "linear-gradient(to right, #064e3b20, #064e3b10)",
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Reaction Wheel Performance</span>
                        <span className="text-emerald-400">92%</span>
                      </div>
                      <Progress
                        value={92}
                        max={100}
                        className="h-1 bg-emerald-950/30"
                        style={{
                          backgroundImage: "linear-gradient(to right, #064e3b20, #064e3b10)",
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Thermal Control System</span>
                        <span className="text-emerald-400">95%</span>
                      </div>
                      <Progress
                        value={95}
                        max={100}
                        className="h-1 bg-emerald-950/30"
                        style={{
                          backgroundImage: "linear-gradient(to right, #064e3b20, #064e3b10)",
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operational Status Card */}
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-blue-400" />
                      Operational Status
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 text-white font-medium">
                      Operational
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Mode:</span>
                      <span className="font-medium">Science Operations</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Downlink:</span>
                      <span className="font-medium text-emerald-400">Nominal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Command Uplink:</span>
                      <span className="font-medium text-emerald-400">Nominal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Science Instruments:</span>
                      <span className="font-medium text-emerald-400">All Operational</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Contact:</span>
                      <span className="font-medium">Today, 09:45 UTC</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* EOL Health Gauge Card */}
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <LifeBuoy className="h-5 w-5 mr-2 text-blue-400" />
                      EOL Readiness
                    </div>
                    <Badge className="bg-gradient-to-r from-amber-600 to-amber-500 border-0 text-white font-medium">
                      Planning Required
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                        <defs>
                          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#fbbf24" />
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#2d3a51" strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#gaugeGradient)"
                          strokeWidth="10"
                          strokeDasharray="282.7"
                          strokeDashoffset={282.7 * (1 - 0.6)}
                          transform="rotate(-90 50 50)"
                        />
                        <text
                          x="50"
                          y="50"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="24"
                          fontWeight="bold"
                          fill="white"
                          className="drop-shadow-md"
                        >
                          60%
                        </text>
                        <text x="50" y="70" textAnchor="middle" fontSize="10" fill="#94a3b8">
                          Readiness
                        </text>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Deorbit Plan:</span>
                      <span className="text-amber-400">In Development</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Passivation Procedures:</span>
                      <span className="text-emerald-400">Ready</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Compliance Status:</span>
                      <span className="text-emerald-400">Compliant</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-xl flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-blue-400" />
                    EOL Metrics Forecast
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Projected trends for key EOL metrics through 2028
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-80">
                    <LineChart data={forecastData} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-[#2d3a51] pt-4">
                  <div className="text-sm text-gray-400">
                    Projections based on current consumption rates and historical trends
                  </div>
                  <Button
                    variant="outline"
                    className="bg-[#0f1520] border-[#2d3a51] hover:bg-[#1a2234] hover:border-[#3d4a61] transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Forecast
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Disposal Options Tab */}
          <TabsContent value="disposal" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {disposalOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all ${
                    option.recommendation === "Recommended"
                      ? "border-l-4 border-l-emerald-500 hover:border-emerald-500/50"
                      : option.recommendation === "Not Recommended"
                        ? "border-l-4 border-l-red-500 hover:border-red-500/50"
                        : "hover:border-blue-500/30"
                  }`}
                >
                  <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                    <CardTitle className="text-lg flex items-center">
                      <option.icon
                        className={`h-5 w-5 mr-2 ${
                          option.recommendation === "Recommended"
                            ? "text-emerald-400"
                            : option.recommendation === "Not Recommended"
                              ? "text-red-400"
                              : "text-blue-400"
                        }`}
                      />
                      {option.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Feasibility:</span>
                        <span className={option.feasibility === "Feasible" ? "text-emerald-400" : "text-red-400"}>
                          {option.feasibility}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fuel Required:</span>
                        <span>{option.fuelRequired}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Recommendation:</span>
                        <span
                          className={
                            option.recommendation === "Recommended"
                              ? "text-emerald-400"
                              : option.recommendation === "Not Recommended"
                                ? "text-red-400"
                                : "text-blue-400"
                          }
                        >
                          {option.recommendation}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                      <Info className="h-4 w-4 inline mr-1" />
                      {option.complianceNote}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={
                        option.recommendation === "Recommended"
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border-0 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 w-full text-white font-medium transition-all"
                          : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 w-full text-white font-medium transition-all"
                      }
                      disabled={option.recommendation === "Not Recommended"}
                    >
                      Simulate {option.title}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30 mb-6">
              <CardHeader className="bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                <CardTitle className="text-xl flex items-center">
                  <Rocket className="h-5 w-5 mr-2 text-blue-400" />
                  Deorbit Trajectory Simulation
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Simulated path for controlled re-entry over South Pacific Ocean
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="aspect-video bg-[#0f1520] rounded-lg border border-[#2d3a51]/50 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] opacity-20 blur-sm"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f1520] pointer-events-none"></div>
                  <div className="text-center p-6 relative z-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Orbit className="h-10 w-10 text-blue-400 opacity-80" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Deorbit Trajectory Visualization</h3>
                    <p className="text-gray-400 mb-6">3D visualization of planned deorbit trajectory</p>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
                      Launch Simulator
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-[#2d3a51] pt-4">
                <div className="text-sm text-gray-400">
                  Simulation based on current orbital parameters and fuel availability
                </div>
                <Button
                  variant="outline"
                  className="bg-[#0f1520] border-[#2d3a51] hover:bg-[#1a2234] hover:border-[#3d4a61] transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Trajectory
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
              <CardHeader className="bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                <CardTitle className="text-xl flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-400" />
                  Compliance with Space Debris Mitigation Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 text-white font-medium">
                        Compliant
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium">25-Year Rule</h4>
                      <p className="text-sm text-gray-400">
                        Satellite will be removed from orbit within 25 years of mission completion through controlled
                        deorbit.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 text-white font-medium">
                        Compliant
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium">Passivation</h4>
                      <p className="text-sm text-gray-400">
                        All energy sources will be depleted at end-of-life to prevent explosions or fragmentation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 text-white font-medium">
                        Compliant
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium">Casualty Risk</h4>
                      <p className="text-sm text-gray-400">
                        Controlled re-entry will ensure debris falls in uninhabited areas, with casualty risk below
                        1:10,000.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 text-white font-medium">
                        Compliant
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium">Collision Avoidance</h4>
                      <p className="text-sm text-gray-400">
                        Satellite will maintain collision avoidance capabilities until final deorbit maneuver.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mission Timeline Tab */}
          <TabsContent value="timeline" className="mt-6">
            <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30 mb-6">
              <CardHeader className="bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                <CardTitle className="text-xl flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  EOL Mission Timeline
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Key events in the satellite's end-of-life planning and execution
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="relative pl-6 border-l border-[#2d3a51]">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="mb-6 relative">
                      <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg shadow-blue-500/20"></div>
                      <div className="mb-1">
                        <span className="text-gray-400 text-sm">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <h4 className="font-medium">{event.event}</h4>
                      <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-lg flex items-center">
                    <Rocket className="h-5 w-5 mr-2 text-blue-400" />
                    Mission History
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Launch</h4>
                      <p className="text-sm text-gray-400">May 22, 2018 - Vandenberg Air Force Base, CA</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Commissioning Complete</h4>
                      <p className="text-sm text-gray-400">June 15, 2018 - Satellite fully operational</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Primary Mission Complete</h4>
                      <p className="text-sm text-gray-400">May 22, 2023 - 5-year design life achieved</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Mission Extension Approved</h4>
                      <p className="text-sm text-gray-400">April 10, 2023 - Extended to 2026</p>
                    </div>
                    <div>
                      <h4 className="font-medium">EOL Planning Initiated</h4>
                      <p className="text-sm text-gray-400">January 1, 2023 - Formal planning process started</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-lg flex items-center">
                    <Trash2 className="h-5 w-5 mr-2 text-blue-400" />
                    Decommissioning Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Science Mission End</h4>
                      <p className="text-sm text-gray-400">December 1, 2025 - Final science data collection</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Deorbit Maneuver</h4>
                      <p className="text-sm text-gray-400">April 1, 2026 - Controlled deorbit initiation</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Passivation</h4>
                      <p className="text-sm text-gray-400">April 15, 2026 - Battery discharge and fuel venting</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Atmospheric Re-entry</h4>
                      <p className="text-sm text-gray-400">May 1, 2026 - Controlled re-entry over South Pacific</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Mission Closeout</h4>
                      <p className="text-sm text-gray-400">June 30, 2026 - Final mission report and data archiving</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                EOL Alerts & Notifications
              </h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search alerts..."
                    className="w-64 bg-[#1a2234]/80 border-[#2d3a51] pl-9 rounded-lg backdrop-blur-sm"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] bg-[#1a2234]/80 border-[#2d3a51] rounded-lg backdrop-blur-sm">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2234] border-[#2d3a51]">
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical Only</SelectItem>
                    <SelectItem value="warning">Warnings Only</SelectItem>
                    <SelectItem value="info">Info Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-red-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-400 mb-1 drop-shadow-glow-red">1</div>
                    <div className="text-sm text-gray-400">Critical Alerts</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-amber-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-400 mb-1 drop-shadow-glow-amber">2</div>
                    <div className="text-sm text-gray-400">Warnings</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-1 drop-shadow-glow-blue">1</div>
                    <div className="text-sm text-gray-400">Info Alerts</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-400 mb-1">4</div>
                    <div className="text-sm text-gray-400">Total Alerts</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
              <CardHeader className="bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                <CardTitle className="text-xl flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-blue-400" />
                  Active Alerts
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Current alerts related to satellite end-of-life status
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`mb-4 p-4 rounded-lg ${
                        alert.severity === "critical"
                          ? "bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-800/50"
                          : alert.severity === "warning"
                            ? "bg-gradient-to-r from-amber-900/30 to-amber-900/10 border border-amber-800/50"
                            : "bg-gradient-to-r from-blue-900/30 to-blue-900/10 border border-blue-800/50"
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3">
                          {alert.severity === "critical" ? (
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          ) : alert.severity === "warning" ? (
                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                          ) : (
                            <Info className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <span className="text-sm text-gray-400">{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-300">{alert.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <Badge
                              className={`${
                                alert.severity === "critical"
                                  ? "bg-gradient-to-r from-red-600 to-red-500"
                                  : alert.severity === "warning"
                                    ? "bg-gradient-to-r from-amber-600 to-amber-500"
                                    : "bg-gradient-to-r from-blue-600 to-blue-500"
                              } border-0 text-white font-medium`}
                            >
                              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-[#2d3a51] pt-4">
                <div className="text-sm text-gray-400">Showing 4 alerts from the last 7 days</div>
                <Button
                  variant="outline"
                  className="bg-[#0f1520] border-[#2d3a51] hover:bg-[#1a2234] hover:border-[#3d4a61] transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Alerts
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
