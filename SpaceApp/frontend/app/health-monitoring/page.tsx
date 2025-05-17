"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  Battery,
  Calendar,
  Clock,
  Download,
  Globe,
  Info,
  RefreshCw,
  Search,
  Settings,
  Sun,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wifi,
  Zap,
  ArrowUp,
  ArrowDown,
  Satellite,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { LineChart } from "@/components/line-chart"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav";
import { getLatestHealthStatus } from '../../services/health/getHealth';
import { transformToFrontendFormat } from '../../utils/transformHealthData';

const [satellitePrimaryData, setSatellitePrimaryData] = useState(null);
const satelliteId = 1;

useEffect(() => {
  const fetchData = async () => {
    try {
      const raw = await getLatestHealthStatus(satelliteId);
      const transformed = transformToFrontendFormat(raw);
      setSatellitePrimaryData(transformed);
    } catch (err) {
      console.error('Failed to fetch satellite health:', err);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 3600000); // every hour

  return () => clearInterval(interval);
}, [satelliteId]);

// Mock data for satellite health metrics
const satelliteData = {
  id: "GRACE-FO-1",
  name: "GRACE-FO 1",
  launchDate: "2018-05-22T11:47:58Z",
  lastUpdated: new Date().toISOString(),
  metrics: {
    time_since_launch: {
      value: formatDistanceToNow(new Date("2018-05-22T11:47:58Z")),
      days: 2536,
      status: "normal",
      history: [2530, 2531, 2532, 2533, 2534, 2535, 2536],
    },
    orbital_altitude: {
      value: 489.75,
      unit: "km",
      status: "normal",
      history: [490.1, 490.0, 489.9, 489.85, 489.8, 489.78, 489.75],
    },
    battery_voltage: {
      value: 27.8,
      unit: "V",
      status: "normal", // normal, warning, critical
      thresholds: { normal: [26, 30], warning: [24, 26], critical: [0, 24] },
      history: [28.2, 28.1, 28.0, 27.9, 27.85, 27.82, 27.8],
    },
    solar_panel_temperature: {
      value: 48.7,
      unit: "°C",
      status: "warning", // normal, warning, critical
      thresholds: { normal: [0, 50], warning: [50, 70], critical: [70, 100] },
      history: [45.2, 46.1, 47.0, 47.5, 48.0, 48.5, 48.7],
    },
    attitude_control_error: {
      value: 0.08,
      unit: "°",
      status: "warning", // normal, warning, critical
      thresholds: { normal: [0, 0.05], warning: [0.05, 0.1], critical: [0.1, 1] },
      history: [0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08],
    },
    data_transmission_rate: {
      value: 9.8,
      unit: "Mbps",
      status: "normal", // normal, warning, critical
      trend: "decreasing", // increasing, stable, decreasing
      history: [10.5, 10.3, 10.2, 10.1, 10.0, 9.9, 9.8],
    },
    thermal_control_status: {
      value: "NORMAL", // NORMAL, OVERHEATING, COOLING
      status: "normal", // normal, warning, critical
      history: ["NORMAL", "NORMAL", "NORMAL", "NORMAL", "NORMAL", "NORMAL", "NORMAL"],
    },
  },
  alerts: [
    {
      id: "alert-1",
      timestamp: "2025-05-05T10:15:00Z",
      metric: "solar_panel_temperature",
      severity: "warning",
      message: "Solar panel temperature approaching threshold (48.7°C)",
    },
    {
      id: "alert-2",
      timestamp: "2025-05-05T09:30:00Z",
      metric: "attitude_control_error",
      severity: "warning",
      message: "Attitude control error increased to 0.08°",
    },
    {
      id: "alert-3",
      timestamp: "2025-05-05T08:45:00Z",
      metric: "data_transmission_rate",
      severity: "info",
      message: "Data transmission rate decreased by 0.7 Mbps in the last 24 hours",
    },
  ],
}

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case "normal":
      return "text-green-400"
    case "warning":
      return "text-yellow-400"
    case "critical":
      return "text-red-400"
    default:
      return "text-gray-400"
  }
}

// Helper function to get status background color
const getStatusBgColor = (status) => {
  switch (status) {
    case "normal":
      return "bg-green-400/10"
    case "warning":
      return "bg-yellow-400/10"
    case "critical":
      return "bg-red-400/10"
    default:
      return "bg-gray-400/10"
  }
}

// for transforming Data*
 const transformToFrontendFormat= (apiData) => {
  return {
    id: apiData.id,
    name: apiData.satelliteName,
    launchDate: "2018-05-22T11:47:58Z", // if static
    metrics: {
      time_since_launch: {
        value: apiData.timeSinceLaunch,
        days: apiData.timeSinceLaunch,
        status: "normal", // ← add your own logic here
        history: [...generateMockHistory(apiData.timeSinceLaunch)],
      },
      battery_voltage: {
        value: apiData.batteryVoltage,
        unit: "V",
        status: getStatus(apiData.batteryVoltage, { normal: [26, 30], warning: [24, 26], critical: [0, 24] }),
        thresholds: { normal: [26, 30], warning: [24, 26], critical: [0, 24] },
        history: [...generateMockHistory(apiData.batteryVoltage)],
      },
      // do the same for others
    },
    alerts: generateAlerts(apiData), // optional
  }
}


// Helper function to get badge variant
const getBadgeVariant = (status) => {
  switch (status) {
    case "normal":
      return "outline"
    case "warning":
      return "warning"
    case "critical":
      return "destructive"
    default:
      return "secondary"
  }
}

// Helper function to get alert icon
const getAlertIcon = (severity) => {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-400" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    case "info":
      return <Info className="h-4 w-4 text-blue-400" />
    default:
      return <Info className="h-4 w-4 text-gray-400" />
  }
}

// Helper function to get metric icon
const getMetricIcon = (metricKey) => {
  switch (metricKey) {
    case "time_since_launch":
      return <Calendar className="h-5 w-5 text-blue-400" />
    case "orbital_altitude":
      return <Globe className="h-5 w-5 text-purple-400" />
    case "battery_voltage":
      return <Battery className="h-5 w-5 text-green-400" />
    case "solar_panel_temperature":
      return <Sun className="h-5 w-5 text-yellow-400" />
    case "attitude_control_error":
      return <Settings className="h-5 w-5 text-orange-400" />
    case "data_transmission_rate":
      return <Wifi className="h-5 w-5 text-blue-400" />
    case "thermal_control_status":
      return <Thermometer className="h-5 w-5 text-red-400" />
    default:
      return <Info className="h-5 w-5 text-gray-400" />
  }
}

// Helper function to get trend icon
const getTrendIcon = (trend) => {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4 text-green-400" />
    case "decreasing":
      return <TrendingDown className="h-4 w-4 text-red-400" />
    default:
      return null
  }
}

// Helper function to format metric name
const formatMetricName = (metricKey) => {
  return metricKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Sparkline component
const Sparkline = ({ data, status }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  let strokeColor
  switch (status) {
    case "normal":
      strokeColor = "#34D399" // green-400
      break
    case "warning":
      strokeColor = "#FBBF24" // yellow-400
      break
    case "critical":
      strokeColor = "#F87171" // red-400
      break
    default:
      strokeColor = "#9CA3AF" // gray-400
  }

  return (
    <svg className="h-8 w-full" viewBox="0 0 100 30" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Metric Card component
const MetricCard = ({ metricKey, metric, onClick }) => {
  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border-l-4 ${
        metric.status === "critical"
          ? "border-l-red-500"
          : metric.status === "warning"
            ? "border-l-yellow-500"
            : "border-l-green-500"
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {getMetricIcon(metricKey)}
          <CardTitle className="text-sm font-medium">{formatMetricName(metricKey)}</CardTitle>
        </div>
        <Badge variant={getBadgeVariant(metric.status)}>{metric.status.toUpperCase()}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {typeof metric.value === "number" ? metric.value.toFixed(2) : metric.value}
            {metric.unit && <span className="ml-1 text-sm">{metric.unit}</span>}
          </div>
          {metric.trend && (
            <div className="flex items-center">
              {metric.trend === "increasing" ? (
                <ArrowUp className="h-4 w-4 text-green-400" />
              ) : metric.trend === "decreasing" ? (
                <ArrowDown className="h-4 w-4 text-red-400" />
              ) : null}
            </div>
          )}
        </div>
        {Array.isArray(metric.history) && (
          <div className="mt-2">
            <Sparkline data={metric.history} status={metric.status} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Detailed Metric Dialog component
const DetailedMetricDialog = ({ metricKey, metric, open, onOpenChange }) => {
  const [timeRange, setTimeRange] = useState("24h")

  // Generate mock historical data based on the time range
  const generateHistoricalData = () => {
    const now = new Date()
    const labels = []
    const data = []

    let points = 24
    let interval = 60 // minutes

    switch (timeRange) {
      case "1h":
        points = 12
        interval = 5
        break
      case "24h":
        points = 24
        interval = 60
        break
      case "7d":
        points = 7
        interval = 24 * 60
        break
      case "30d":
        points = 30
        interval = 24 * 60
        break
    }

    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * interval * 60000)
      labels.push(format(date, timeRange === "1h" ? "HH:mm" : timeRange === "24h" ? "HH:mm" : "MMM dd"))

      // Generate a value with some random variation
      const baseValue = typeof metric.value === "number" ? metric.value : 0
      const randomVariation = (Math.random() - 0.5) * (baseValue * 0.1)
      data.push(baseValue + randomVariation)
    }

    return { labels, data }
  }

  const historicalData = generateHistoricalData()

  const chartData = {
    labels: historicalData.labels,
    datasets: [
      {
        label: formatMetricName(metricKey),
        data: historicalData.data,
        borderColor:
          metric.status === "critical"
            ? "#F87171" // red-400
            : metric.status === "warning"
              ? "#FBBF24" // yellow-400
              : "#34D399", // green-400
        backgroundColor:
          metric.status === "critical"
            ? "rgba(248, 113, 113, 0.1)" // red-400 with alpha
            : metric.status === "warning"
              ? "rgba(251, 191, 36, 0.1)" // yellow-400 with alpha
              : "rgba(52, 211, 153, 0.1)", // green-400 with alpha
      },
    ],
  }

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: `Historical data for ${formatMetricName(metricKey)} is being downloaded.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getMetricIcon(metricKey)}
            <DialogTitle>{formatMetricName(metricKey)}</DialogTitle>
          </div>
          <DialogDescription>Historical data and analysis for {satelliteData.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {typeof metric.value === "number" ? metric.value.toFixed(2) : metric.value}
              {metric.unit && <span className="ml-1 text-sm">{metric.unit}</span>}
            </div>
            <Badge variant={getBadgeVariant(metric.status)}>{metric.status.toUpperCase()}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Select time range:</div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-[300px] w-full">
            <LineChart data={chartData} />
          </div>

          {metric.thresholds && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Thresholds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metric.thresholds).map(([level, range]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="capitalize">{level}:</div>
                      <div className={`font-mono ${getStatusColor(level)}`}>
                        {range[0]} - {range[1]} {metric.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">About this Metric</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {metricKey === "time_since_launch" &&
                  "Time Since Launch indicates how long the satellite has been operational in space. This helps track the satellite's age relative to its expected mission lifetime."}
                {metricKey === "orbital_altitude" &&
                  "Orbital Altitude represents the satellite's height above Earth's surface. Maintaining the correct altitude is crucial for the satellite's mission and orbital stability."}
                {metricKey === "battery_voltage" &&
                  "Battery Voltage indicates the electrical potential of the satellite's power system. Proper voltage levels ensure all systems receive adequate power for operation."}
                {metricKey === "solar_panel_temperature" &&
                  "Solar Panel Temperature measures how hot the satellite's solar arrays are. Excessive temperatures can reduce efficiency and potentially damage the panels."}
                {metricKey === "attitude_control_error" &&
                  "Attitude Control Error shows the deviation from the satellite's desired orientation. Precise attitude control is essential for instrument pointing, communication, and solar panel alignment."}
                {metricKey === "data_transmission_rate" &&
                  "Data Transmission Rate indicates how quickly the satellite can send information back to Earth. Higher rates allow for more data collection and transmission."}
                {metricKey === "thermal_control_status" &&
                  "Thermal Control Status shows the current state of the satellite's temperature management system. Proper thermal control prevents components from overheating or becoming too cold."}
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function HealthMonitoringPage() {
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [detailedMetricOpen, setDetailedMetricOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [overallHealth, setOverallHealth] = useState(85)

  // Calculate overall health percentage
  useEffect(() => {
    const metrics = Object.values(satelliteData.metrics)
    const normalCount = metrics.filter((m) => m.status === "normal").length
    const percentage = Math.round((normalCount / metrics.length) * 100)
    setOverallHealth(percentage)
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return

    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [realTimeUpdates])

  const handleMetricClick = (metricKey) => {
    setSelectedMetric(metricKey)
    setDetailedMetricOpen(true)
  }

  const handleRefresh = () => {
    setLastUpdated(new Date())
    toast({
      title: "Data Refreshed",
      description: "Latest satellite health data has been loaded.",
    })
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    })
  }

  // Filter metrics based on search and status filter
  const filteredMetrics = Object.entries(satelliteData.metrics).filter(([key, metric]) => {
    const matchesSearch = formatMetricName(key).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || metric.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Count alerts by severity
  const alertCounts = {
    critical: satelliteData.alerts.filter((a) => a.severity === "critical").length,
    warning: satelliteData.alerts.filter((a) => a.severity === "warning").length,
    info: satelliteData.alerts.filter((a) => a.severity === "info").length,
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
          className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold fancy-title">Satellite Health Monitoring Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Real-time monitoring of satellite health metrics to ensure optimal performance and early issue detection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Satellite className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Satellite</div>
                <div className="font-medium">{satelliteData.name}</div>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Last Updated</div>
                <div className="font-medium">{format(lastUpdated, "HH:mm:ss")}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
              <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{overallHealth}%</div>
                <Progress value={overallHealth} className="flex-1" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {overallHealth >= 90
                  ? "Excellent condition"
                  : overallHealth >= 75
                    ? "Good condition"
                    : overallHealth >= 50
                      ? "Fair condition"
                      : "Needs attention"}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <div className="rounded-full bg-yellow-100 p-1 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{satelliteData.alerts.length}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                {alertCounts.critical > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {alertCounts.critical} Critical
                  </Badge>
                )}
                {alertCounts.warning > 0 && (
                  <Badge variant="warning" className="text-[10px]">
                    {alertCounts.warning} Warning
                  </Badge>
                )}
                {alertCounts.info > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {alertCounts.info} Info
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mission Status</CardTitle>
              <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/20">
                <Globe className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Operational</div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <Calendar className="mr-1 h-3 w-3" />
                <span>Mission day {satelliteData.metrics.time_since_launch.days}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Health Metrics</h2>
            <Badge variant="outline" className="ml-2">
              {Object.keys(satelliteData.metrics).length} metrics
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search metrics..."
                className="pl-8 w-full sm:w-[200px] md:w-[260px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>

              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Real-time updates toggle */}
        <motion.div
          className="flex items-center justify-end mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <Switch id="realtime" checked={realTimeUpdates} onCheckedChange={setRealTimeUpdates} />
            <Label htmlFor="realtime" className="text-sm">
              Real-time updates
            </Label>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {filteredMetrics.length > 0 ? (
            filteredMetrics.map(([key, metric]) => (
              <MetricCard key={key} metricKey={key} metric={metric} onClick={() => handleMetricClick(key)} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium">No metrics found</h3>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
              <Button variant="outline" className="mt-4" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Alerts Section */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Alerts</h2>
            <Button variant="outline" size="sm">
              View All Alerts
            </Button>
          </div>

          <div className="space-y-3">
            {satelliteData.alerts.map((alert) => (
              <Card key={alert.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{alert.message}</div>
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : alert.severity === "warning"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{format(new Date(alert.timestamp), "MMM dd, yyyy HH:mm")}</span>
                        <span className="mx-2">•</span>
                        <span>{formatMetricName(alert.metric)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Detailed Metric Dialog */}
      {selectedMetric && (
        <DetailedMetricDialog
          metricKey={selectedMetric}
          metric={satelliteData.metrics[selectedMetric]}
          open={detailedMetricOpen}
          onOpenChange={setDetailedMetricOpen}
        />
      )}
    </div>
  )
}
