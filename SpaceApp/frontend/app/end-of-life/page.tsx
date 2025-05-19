"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  AlertTriangle,
  Battery,
  Calendar,
  Clock,
  Compass,
  Download,
  Filter,
  Info,
  Layers,
  Orbit,
  RefreshCw,
  Rocket,
  Search,
  Share2,
  Sun,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { motion } from "framer-motion"
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart } from "@/components/line-chart"
import { useTrackedSatellites } from "@/contexts/TrackedSatellitesContext"

interface Satellite {
  id: string;
  name: string;
  noradId: string;
}

interface HealthStatus {
  satelliteId: number;
  satelliteName: string;
  timeSinceLaunch: number;
  orbitalAltitude: number;
  batteryVoltage: number;
  solarPanelTemperature: number;
  attitudeControlError: number;
  dataTransmissionRate: number;
  thermalControlStatus: number;
  prediction: number;
  probability: number;
  explanation: {
    thermal_control_status: number;
    time_since_launch: number;
    battery_voltage: number;
    data_transmission_rate: number;
    solar_panel_temperature: number;
    attitude_control_error: number;
    orbital_altitude: number;
  };
  timestamp: string; // or Date if you plan to convert it: timestamp: Date;
}


interface EolStatus {
  noradId: string;
  eccentricity: number;
  orbitalVelocity: number;
  raan: number;
  collisionWarning: number;
  orbitalAltitude: number;
  line1Epoch: string;
  motionLaunchInteraction: number;
  meanMotion: number;
  prediction: number;
  timestamp: string;
}

interface Metrics {
  battery: {
    voltage: number;
    status: string;
    percentage: number;
  };
  thermal: {
    temperature: number;
    status: string;
    percentage: number;
  };
  performance: {
    attitudeError: number;
    status: string;
    percentage: number;
  };
}

interface Forecast {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

interface Alert {
  title: string;
  description: string;
  severity: string;
  timestamp: string;
}

interface Timeline {
  history: {
    date: string;
    event: string;
    description: string;
  }[];
  upcoming: {
    date: string;
    event: string;
    description: string;
  }[];
}

interface DisposalOption {
  id: string;
  title: string;
  description: string;
  feasibility: string;
  recommendation: string;
  complianceNote: string;
}

export default function EndOfLifePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedSatellite, setSelectedSatellite] = useState("")
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [eolStatus, setEolStatus] = useState<EolStatus | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [disposalOptions, setDisposalOptions] = useState<DisposalOption[]>([])
  
  const { satellites, isLoading: isSatellitesLoading, error: satellitesError, refreshSatellites } = useTrackedSatellites()
  const [isDataLoading, setIsDataLoading] = useState(false)
  const isLoading = isSatellitesLoading || isDataLoading

  useEffect(() => {
    if (satellites && satellites.length > 0 && !selectedSatellite) {
      setSelectedSatellite(satellites[0].id)
    }
  }, [satellites, selectedSatellite])

  useEffect(() => {
    if (selectedSatellite) {
      fetchSatelliteData(selectedSatellite)
    }
  }, [selectedSatellite])

  const fetchSatelliteData = async (satelliteId: string) => {
    setIsDataLoading(true)
    try {
      // Fetch all data in parallel
      const [metricsRes, forecastRes, alertsRes, timelineRes, disposalRes, healthRes, eolRes] = await Promise.all([
        fetch(`http://localhost:8080/api/eol/metrics/${satelliteId}`),
        fetch(`http://localhost:8080/api/eol/forecast/${satelliteId}`),
        fetch(`http://localhost:8080/api/eol/alerts/${satelliteId}`),
        fetch(`http://localhost:8080/api/eol/timeline/${satelliteId}`),
        fetch(`http://localhost:8080/api/eol/disposal-options/${satelliteId}`),
        fetch(`http://localhost:8080/api/satellites/${satelliteId}/health`),
        fetch(`http://localhost:8080/api/satellites/${satelliteId}/eol`)
      ])

      const [metricsData, forecastData, alertsData, timelineData, disposalData, healthData, eolData] = await Promise.all([
        metricsRes.json(),
        forecastRes.json(),
        alertsRes.json(),
        timelineRes.json(),
        disposalRes.json(),
        healthRes.json(),
        eolRes.json()
      ])

      setMetrics(metricsData)
      setForecast(forecastData)
      setAlerts(alertsData)
      setTimeline(timelineData)
      setDisposalOptions(disposalData)
      setHealthStatus(healthData)
      setEolStatus(eolData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching satellite data:', error)
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleRefresh = () => {
    refreshSatellites();
    if (selectedSatellite) {
      fetchSatelliteData(selectedSatellite);
    }
  }

  const handleSatelliteChange = useCallback((value: string) => {
    if (isLoading) return; // Prevent selection while loading
    setSelectedSatellite(value);
  }, [isLoading]);

  const satelliteOptions = useMemo(() => {
    if (!satellites || !Array.isArray(satellites)) {
      return [];
    }
    
    return satellites.map((sat) => ({
      key: sat.id || sat.noradId,
      value: sat.id || sat.noradId,
      label: `${sat.name} (${sat.noradId})`
    }));
  }, [satellites]);

  const batteryData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Battery Voltage",
        data: [12.8, 12.7, 12.6, 12.5, 12.4, 12.3, 12.2, 12.1, 12.0, 11.9, 11.8, 11.7],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
      {
        label: "Battery Temperature",
        data: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
      }
    ],
  }

  const thermalData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Solar Panel Temperature",
        data: [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
      },
      {
        label: "Internal Temperature",
        data: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
      }
    ],
  }

  const performanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Attitude Control Error",
        data: [0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.065],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
      },
      {
        label: "Data Transmission Rate",
        data: [1.5, 1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
      }
    ],
  }

  

  const timelineEvents = [
    {
      date: "2023-01-01",
      event: "EOL Planning Initiated",
      description: "End-of-life planning process started.",
    },
    {
      date: "2023-12-15",
      event: "Critical Battery Alert",
      description: "Battery voltage dropped below threshold.",
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
      event: "System Passivation",
      description: "Projected date for system passivation.",
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

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              End-of-Life Monitoring
            </h1>
            <p className="text-gray-400">Monitor and manage satellite end-of-life status</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select 
              value={selectedSatellite} 
              onValueChange={handleSatelliteChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[200px] bg-[#1a2234]/80 border-[#2d3a51]">
                <SelectValue placeholder="Select satellite" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2234] border-[#2d3a51]">
                {satelliteOptions.map((option) => (
                  <SelectItem key={option.key} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg bg-[#1a2234]/80 border-[#2d3a51] hover:bg-[#2d3a51]/80 hover:border-blue-500/50 transition-all backdrop-blur-sm"
              onClick={handleRefresh}
              disabled={isLoading}
                >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
                </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all rounded-lg">
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Prediction Score Card */}
            {healthStatus && (
              <Card className="mb-6 bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
            <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-400" />
                      Prediction Score
                    </div>
                    <Badge className="bg-gradient-to-r from-amber-600 to-amber-500 border-0 text-white font-medium">
                      Warning
                    </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-4xl font-bold mb-2">{healthStatus.prediction.toFixed(2)}</div>
                      <Progress value={healthStatus.prediction * 100} max={100} className="h-2 mb-4 bg-amber-950/30" />
                      <div className="text-sm text-gray-400">{healthStatus.explanation.attitude_control_error}</div>
                </div>
                    <div>
                      <div className="text-4xl font-bold mb-2">{healthStatus.probability.toFixed(2)}</div>
                      <Progress value={healthStatus.probability * 100} max={100} className="h-2 mb-4 bg-blue-950/30" />
                      <div className="text-sm text-gray-400">Probability of end-of-life event</div>
                </div>
                </div>
                </CardContent>
              </Card>
            )}

            {/* Satellite Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Battery Status Card */}
              {metrics?.battery && (
                <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                  <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Battery className="h-5 w-5 mr-2 text-blue-400" />
                        Battery Status
                </div>
                      <Badge className={`bg-gradient-to-r ${
                        metrics.battery.status === 'critical' 
                          ? 'from-red-600 to-red-500' 
                          : metrics.battery.status === 'warning'
                          ? 'from-amber-600 to-amber-500'
                          : 'from-emerald-600 to-emerald-500'
                      } border-0 text-white font-medium`}>
                        {metrics.battery.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-4xl font-bold mb-2">{metrics.battery.voltage.toFixed(1)}V</div>
                    <Progress value={metrics.battery.percentage} max={100} className="h-2 mb-4 bg-red-950/30" />
                    <div className="text-sm text-gray-400">Battery voltage status</div>
                  </CardContent>
                </Card>
              )}

              {/* Thermal Status Card */}
              {metrics?.thermal && (
                <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                  <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Sun className="h-5 w-5 mr-2 text-amber-400" />
                        Thermal Status
              </div>
                      <Badge className={`bg-gradient-to-r ${
                        metrics.thermal.status === 'critical' 
                          ? 'from-red-600 to-red-500' 
                          : metrics.thermal.status === 'warning'
                          ? 'from-amber-600 to-amber-500'
                          : 'from-emerald-600 to-emerald-500'
                      } border-0 text-white font-medium`}>
                        {metrics.thermal.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-4xl font-bold mb-2">{metrics.thermal.temperature.toFixed(1)}°C</div>
                    <Progress value={metrics.thermal.percentage} max={100} className="h-2 mb-4 bg-amber-950/30" />
                    <div className="text-sm text-gray-400">Solar panel temperature</div>
            </CardContent>
          </Card>
              )}

              {/* Performance Metrics Card */}
              {metrics?.performance && (
                <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                  <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Compass className="h-5 w-5 mr-2 text-emerald-400" />
                        Performance Metrics
                      </div>
                      <Badge className={`bg-gradient-to-r ${
                        metrics.performance.status === 'critical' 
                          ? 'from-red-600 to-red-500' 
                          : metrics.performance.status === 'warning'
                          ? 'from-amber-600 to-amber-500'
                          : 'from-emerald-600 to-emerald-500'
                      } border-0 text-white font-medium`}>
                        {metrics.performance.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-4xl font-bold mb-2">{metrics.performance.attitudeError.toFixed(2)}°</div>
                    <Progress value={metrics.performance.percentage} max={100} className="h-2 mb-4 bg-emerald-950/30" />
                    <div className="text-sm text-gray-400">Attitude control error</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Satellite Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Basic Info Card */}
          <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
            <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
              <CardTitle className="text-lg flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-400" />
                    Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                      <span className="text-gray-400">Satellite ID:</span>
                      <span className="font-medium">{eolStatus?.noradId}</span>
                </div>
                <div className="flex justify-between">
                      <span className="text-gray-400">Satellite Name:</span>
                      <span className="font-medium">{healthStatus?.satelliteName}</span>
                </div>
                <div className="flex justify-between">
                      <span className="text-gray-400">Time Since Launch:</span>
                      <span className="font-medium">{healthStatus?.timeSinceLaunch}</span>
                </div>
                  </div>
                </CardContent>
              </Card>

              {/* Orbital Status Card */}
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-lg flex items-center">
                    <Orbit className="h-5 w-5 mr-2 text-blue-400" />
                    Orbital Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                <div className="flex justify-between">
                      <span className="text-gray-400">Orbital Altitude:</span>
                      <span className="font-medium">{eolStatus?.orbitalAltitude.toFixed(2)} km</span>
                </div>
              </div>
            </CardContent>
          </Card>

              {/* System Status Card */}
          <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
            <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
              <CardTitle className="text-lg flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-blue-400" />
                    System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                      <span className="text-gray-400">Thermal Control:</span>
                      <span className="font-medium">{healthStatus?.thermalControlStatus}</span>
                </div>
                <div className="flex justify-between">
                      <span className="text-gray-400">Solar Panel Temp:</span>
                      <span className="font-medium">{metrics?.thermal?.temperature.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                      <span className="text-gray-400">Last Update:</span>
                      <span className="font-medium">{lastUpdated.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alert */}
            <Alert className="mb-6 bg-red-950/20 border-red-500/20 text-red-400">
          <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical: Battery Voltage Below Threshold</AlertTitle>
          <AlertDescription>
                Satellite battery voltage has dropped below critical threshold. Monitor closely and prepare for potential
                deorbit procedures.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs defaultValue="metrics" className="mb-6">
          <TabsList className="bg-[#1a2234]/80 border border-[#2d3a51] rounded-lg p-1 backdrop-blur-sm">
            <TabsTrigger
              value="metrics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-md transition-all"
            >
                  Health Metrics
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

              {/* Health Metrics Tab */}
          <TabsContent value="metrics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Battery Card */}
                  <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                    <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                      <Battery className="h-5 w-5 mr-2 text-blue-400" />
                          Battery Status
                      </div>
                        <Badge className="bg-gradient-to-r from-red-600 to-red-500 border-0 text-white font-medium">
                          Critical
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-4xl font-bold mb-2">{metrics?.battery.voltage.toFixed(1)}V</div>
                      <Progress value={metrics?.battery.percentage} max={100} className="h-2 mb-4 bg-red-950/30" />
                      <div className="text-sm text-gray-400">Battery voltage status</div>
                    </CardContent>
                  </Card>

                  {/* Solar Panel Card */}
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                          <Sun className="h-5 w-5 mr-2 text-amber-400" />
                          Thermal Status
                    </div>
                    <Badge className="bg-gradient-to-r from-amber-600 to-amber-500 border-0 text-white font-medium">
                      Warning
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                      <div className="text-4xl font-bold mb-2">{metrics?.thermal?.temperature.toFixed(1)}°C</div>
                      <Progress value={metrics?.thermal?.percentage} max={100} className="h-2 mb-4 bg-amber-950/30" />
                      <div className="text-sm text-gray-400">Solar panel temperature</div>
                </CardContent>
              </Card>

                  {/* Performance Card */}
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                          <Compass className="h-5 w-5 mr-2 text-emerald-400" />
                          Performance Metrics
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 text-white font-medium">
                          Normal
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                      <div className="text-4xl font-bold mb-2">{metrics?.performance.attitudeError.toFixed(2)}°</div>
                      <Progress value={metrics?.performance.percentage} max={100} className="h-2 mb-4 bg-emerald-950/30" />
                      <div className="text-sm text-gray-400">Attitude control error</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardHeader className="bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                  <CardTitle className="text-xl flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-blue-400" />
                        Health Metrics Forecast
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                        Projected trends for key health metrics through 2028
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-80">
                        <LineChart data={forecast} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-[#2d3a51] pt-4">
                  <div className="text-sm text-gray-400">
                        Projections based on current measurements and historical trends
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

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Health Alerts & Notifications
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
                        <div className="text-4xl font-bold text-red-400 mb-1 drop-shadow-glow-red">
                          {alerts.filter(a => a.severity === 'critical').length}
                        </div>
                    <div className="text-sm text-gray-400">Critical Alerts</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-amber-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                        <div className="text-4xl font-bold text-amber-400 mb-1 drop-shadow-glow-amber">
                          {alerts.filter(a => a.severity === 'warning').length}
                        </div>
                    <div className="text-sm text-gray-400">Warnings</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                        <div className="text-4xl font-bold text-blue-400 mb-1 drop-shadow-glow-blue">
                          {alerts.filter(a => a.severity === 'info').length}
                        </div>
                    <div className="text-sm text-gray-400">Info Alerts</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                        <div className="text-4xl font-bold text-gray-400 mb-1">{alerts.length}</div>
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
                      Current alerts related to satellite health status
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                    <div className="space-y-4">
                      {alerts.map((alert, index) => (
                        <div
                          key={`${alert.timestamp}-${index}`}
                          className="flex items-start space-x-4 p-4 rounded-lg bg-[#0f1520]/50 border border-[#2d3a51]"
                        >
                          <div
                            className={`p-2 rounded-full ${
                        alert.severity === "critical"
                                ? "bg-red-500/20 text-red-400"
                          : alert.severity === "warning"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                            <h4 className="font-medium">{alert.title}</h4>
                            <Badge
                              className={`${
                                alert.severity === "critical"
                                    ? "bg-red-500/20 text-red-400"
                                  : alert.severity === "warning"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-blue-500/20 text-blue-400"
                                }`}
                              >
                                {alert.severity}
                            </Badge>
                          </div>
                            <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-[#2d3a51] pt-4">
                    <div className="text-sm text-gray-400">Showing {alerts.length} alerts from the last 7 days</div>
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

              {/* Disposal Options Tab */}
              <TabsContent value="disposal" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {disposalOptions.map((option) => (
                    <Card
                      key={option.id}
                      className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30"
                    >
                      <CardHeader className="pb-2 bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                        <CardTitle className="text-lg flex items-center">
                          <option.icon className="h-5 w-5 mr-2 text-blue-400" />
                          {option.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-400 mb-4">{option.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Feasibility:</span>
                            <span className="font-medium">{option.feasibility}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Recommendation:</span>
                            <span className="font-medium">{option.recommendation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Compliance:</span>
                            <span className="font-medium">{option.complianceNote}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Mission Timeline Tab */}
              <TabsContent value="timeline" className="mt-6">
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
                        {timeline?.history.map((event, index) => (
                          <div key={index}>
                            <h4 className="font-medium">{event.event}</h4>
                            <p className="text-sm text-gray-400">{event.date} - {event.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a2234]/80 border-[#2d3a51] rounded-xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
                    <CardHeader className="bg-gradient-to-r from-[#1a2234] to-[#1a2234]/50">
                      <CardTitle className="text-lg flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                        Upcoming Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Deorbit Planning</h4>
                          <p className="text-sm text-gray-400">Q1 2024 - Detailed planning phase</p>
                        </div>
                        <div>
                          <h4 className="font-medium">System Passivation</h4>
                          <p className="text-sm text-gray-400">Q2 2024 - Prepare for passivation</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Final Science Mission</h4>
                          <p className="text-sm text-gray-400">Q4 2024 - Complete remaining objectives</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Deorbit Maneuver</h4>
                          <p className="text-sm text-gray-400">Q1 2025 - Execute deorbit sequence</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
        </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
