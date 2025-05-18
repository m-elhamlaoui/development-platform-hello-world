"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { motion, HTMLMotionProps } from "framer-motion"
import type { MotionProps } from "framer-motion"
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
  Rocket,
  AlertOctagon,
  AlertCircle,
  Compass,
  Signal,
  Activity,
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
import { UserNav } from "@/components/user-nav"
import { getLatestHealthStatus, getHistoricalHealthData } from '../../services/health/getHealth'
import { cn } from "@/lib/utils"
import { useSearchParams, useRouter } from 'next/navigation'
import { useSatellites } from "@/hooks/useSatellites"
import dynamic from 'next/dynamic'
import { MotionDiv } from "@/components/ui/motion"
import HealthMonitoringLoading from "./loading"
import { useHealthData } from "@/hooks/useHealthData"

// Dynamically import heavy components with loading states
const DetailedMetricDialog = dynamic(() => import("@/components/detailed-metric-dialog"), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-[#1a2234] rounded-lg p-6">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  </div>,
  ssr: false
})

type MetricStatus = 'normal' | 'warning' | 'critical';
type AlertSeverity = 'info' | 'warning' | 'critical';
type TrendDirection = 'increasing' | 'decreasing' | 'stable';
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface Metric {
  value: number | string;
  unit?: string;
  status: MetricStatus;
  history?: (number | string)[];
  trend?: TrendDirection;
  days?: number;
  thresholds?: {
    normal: [number, number];
    warning: [number, number];
    critical: [number, number];
  };
}

interface SatelliteData {
  id: number;
  name: string;
  timestamp: string;
  prediction: number;
  probability: number;
  metrics: {
    [key: string]: Metric;
  };
}

interface MetricCardProps {
  metricKey: string;
  metric: Metric;
  onClick: (key: string) => void;
}

interface SparklineProps {
  data: (number | string)[];
  status: MetricStatus;
}

type TimeRangeOption = "1h" | "24h" | "7d" | "30d";

interface AvailableRanges {
  "1h": boolean;
  "24h": boolean;
  "7d": boolean;
  "30d": boolean;
}

// Add new interface for Satellite
interface Satellite {
  _id: string;
  name: string;
  norad_id: number;
  Owner: string;
  launchDate: string;
  launchSite: string;
  popular: string;
}

// Mock data for satellite health metrics
const satelliteData: SatelliteData = {
  id: 48272,
  name: "GRACE-FO 1",
  timestamp: "2025-05-05T10:15:00Z",
  prediction: 1,
  probability: 0.95,
  metrics: {
    time_since_launch: {
      value: "4 years 2 months",
      days: 1479,
      status: "normal" as MetricStatus,
      history: [1475, 1476, 1477, 1478, 1479, 1480, 1481]
    },
    orbital_altitude: {
      value: 500,
      unit: "km",
      status: "normal" as MetricStatus,
      history: [498, 499, 500, 501, 502, 501, 500]
    },
    battery_voltage: {
      value: 28.5,
      unit: "V",
      status: "normal" as MetricStatus,
      history: [28.3, 28.4, 28.5, 28.6, 28.5, 28.4, 28.5]
    },
    solar_panel_temperature: {
      value: 45.2,
      unit: "°C",
      status: "normal" as MetricStatus,
      history: [44.8, 45.0, 45.2, 45.3, 45.1, 45.2, 45.2]
    },
    attitude_control_error: {
      value: 0.03,
      unit: "°",
      status: "normal" as MetricStatus,
      history: [0.02, 0.03, 0.03, 0.02, 0.03, 0.03, 0.03]
    },
    data_transmission_rate: {
      value: 150.5,
      unit: "Mbps",
      status: "normal" as MetricStatus,
      trend: "stable" as TrendDirection,
      history: [150, 150.2, 150.5, 150.4, 150.5, 150.5, 150.5]
    },
    thermal_control_status: {
      value: "NORMAL",
      status: "normal" as MetricStatus,
      history: Array(7).fill("NORMAL")
    }
  }
};

// Helper function to get status color
const getStatusColor = (status: MetricStatus): string => {
  switch (status) {
    case 'critical':
      return 'text-red-500';
    case 'warning':
      return 'text-yellow-500';
    case 'normal':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

// Helper function to get status background color
const getStatusBgColor = (status: MetricStatus): string => {
  switch (status) {
    case 'critical':
      return 'bg-red-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'normal':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

// Helper function to get badge variant
const getBadgeVariant = (status: MetricStatus): BadgeVariant => {
  switch (status) {
    case 'critical':
      return 'destructive';
    case 'warning':
      return 'outline';
    case 'normal':
      return 'secondary';
    default:
      return 'default';
  }
};

// Helper function to get alert icon
const getAlertIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical':
      return <AlertOctagon className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

// Helper function to get metric icon
const getMetricIcon = (metricKey: string) => {
  switch (metricKey) {
    case 'time_since_launch':
      return <Rocket className="h-4 w-4 text-blue-500" />;
    case 'orbital_altitude':
      return <ArrowUp className="h-4 w-4 text-blue-500" />;
    case 'battery_voltage':
      return <Battery className="h-4 w-4 text-green-500" />;
    case 'solar_panel_temperature':
      return <Thermometer className="h-4 w-4 text-red-500" />;
    case 'attitude_control_error':
      return <Compass className="h-4 w-4 text-yellow-500" />;
    case 'data_transmission_rate':
      return <Signal className="h-4 w-4 text-purple-500" />;
    case 'thermal_control_status':
      return <Thermometer className="h-4 w-4 text-orange-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

// Helper function to get trend icon
const getTrendIcon = (trend: TrendDirection) => {
  switch (trend) {
    case 'increasing':
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    case 'decreasing':
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

// Helper function to format metric name
const formatMetricName = (metricKey: string): string => {
  return metricKey
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Sparkline component
const Sparkline = ({ data, status }: SparklineProps) => {
  // Convert string data to numbers if needed
  const numericData = data.map(value => typeof value === 'string' ? 1 : value);
  const max = Math.max(...numericData);
  const min = Math.min(...numericData);
  const range = max - min || 1; // Prevent division by zero
  const points = numericData
    .map((value, index) => {
      const x = (index / (numericData.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  let strokeColor;
  switch (status) {
    case "normal":
      strokeColor = "#34D399"; // green-400
      break;
    case "warning":
      strokeColor = "#FBBF24"; // yellow-400
      break;
    case "critical":
      strokeColor = "#F87171"; // red-400
      break;
    default:
      strokeColor = "#9CA3AF"; // gray-400
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
  );
};

// Metric Card component
const MetricCard = ({ metricKey, metric, onClick }: MetricCardProps) => {
  const shouldShowGraph = metricKey !== 'time_since_launch';

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all hover:shadow-lg",
        metric.status === "critical" && "border-l-4 border-l-red-500",
        metric.status === "warning" && "border-l-4 border-l-yellow-500",
        metric.status === "normal" && "border-l-4 border-l-green-500"
      )}
      onClick={() => onClick(metricKey)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{formatMetricName(metricKey)}</CardTitle>
        <Badge variant={getBadgeVariant(metric.status)}>
          {metric.status.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {typeof metric.value === "number" ? metric.value.toFixed(2) : metric.value}
              {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
            </div>
          </div>
          {shouldShowGraph && metric.history && <Sparkline data={metric.history} status={metric.status} />}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to format time since launch
const formatTimeSinceLaunch = (days: number): string => {
  const years = Math.floor(days / 365);
  const remainingDays = Math.round(days % 365);
  
  if (years === 0) {
    return `${remainingDays} days`;
  } else if (remainingDays === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'} ${remainingDays} days`;
  }
};

// Helper function to generate mock history data
const generateMockHistory = (value: number, count = 7, variation = 0.02): number[] => {
  return Array.from({ length: count }, () => {
    const noise = (Math.random() - 0.5) * 2 * variation * value;
    return parseFloat((value + noise).toFixed(2));
  });
};

// Helper function to get status based on thresholds
const getStatus = (
  value: number,
  thresholds: {
    normal: [number, number];
    warning: [number, number];
    critical: [number, number];
  }
): MetricStatus => {
  if (value >= thresholds.critical[0] && value < thresholds.critical[1]) return 'critical';
  if (value >= thresholds.warning[0] && value < thresholds.warning[1]) return 'warning';
  if (value >= thresholds.normal[0] && value <= thresholds.normal[1]) return 'normal';
  return 'normal';
};

export default function HealthMonitoringPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [satelliteSearch, setSatelliteSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [detailedMetricOpen, setDetailedMetricOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const { data: healthData, isLoading: isLoadingHealth, error: healthError, lastUpdated: healthLastUpdated, refresh } = useHealthData(Number(searchParams?.get('norad_id')) || 48272)
  const { satellites, isLoading: isLoadingSatellites, error: satellitesError, uniqueOwners } = useSatellites()

  // Memoize filtered satellites based on search and owner filter
  const filteredSatellites = useMemo(() => {
    return satellites.filter(sat => {
      const matchesSearch = sat.name.toLowerCase().includes(satelliteSearch.toLowerCase()) ||
                          sat.norad_id.toString().includes(satelliteSearch)
      const matchesOwner = ownerFilter === "all" || sat.owner === ownerFilter
      return matchesSearch && matchesOwner
    })
  }, [satellites, satelliteSearch, ownerFilter])

  // Update the satellite selection handler
  const handleSatelliteSelect = (selectedNoradId: number) => {
    router.push(`/health-monitoring?norad_id=${selectedNoradId}`);
  };

  // Simulate real-time updates (UI only)
  useEffect(() => {
    if (!realTimeUpdates) return
    const interval = setInterval(() => setLastUpdated(new Date()), 30000)
    return () => clearInterval(interval)
  }, [realTimeUpdates])

  const handleMetricClick = (metricKey: string) => {
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

  if (isLoadingHealth || isLoadingSatellites) {
    return <HealthMonitoringLoading />
  }

  if (healthError || satellitesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1520] text-white p-6">
        <div className="text-red-400 mb-4">
          {healthError || satellitesError}
        </div>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!healthData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1520] text-white p-6">
        <div className="text-gray-400 mb-4">
          No health data available
        </div>
      </div>
    )
  }

  // Filter metrics based on search and status filter, excluding time_since_launch from the grid
  const filteredMetrics = Object.entries(healthData.metrics).filter(([key, metric]) => {
    const matchesSearch = formatMetricName(key).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || metric.status === statusFilter;
    const isNotTimeSinceLaunch = key !== 'time_since_launch';
    return matchesSearch && matchesStatus && isNotTimeSinceLaunch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#0f1520] text-white">
      {/* Header */}
      <header className="app-header border-b border-[#1e2a41]">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center mr-8">
            <MotionDiv
              className="w-8 h-8 bg-white rounded mr-2 flex items-center justify-center"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex' }}
            >
              <div className="w-4 h-4 bg-[#0f1520]"></div>
            </MotionDiv>
            <span className="font-bold text-lg gradient-text">Orbital</span>
          </Link>
          <MainNav />
          
          {/* Updated Satellite Selector */}
          <div className="flex-1 flex items-center justify-end space-x-4">
            <div className="w-[300px]">
              <Select
                value={searchParams?.get('norad_id') || ''}
                onValueChange={(value) => handleSatelliteSelect(Number(value))}
              >
                <SelectTrigger className="bg-[#1e2a41] border-none">
                  <SelectValue placeholder="Select Satellite" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2a41] border-none">
                  <div className="p-2 space-y-2">
                    <Input
                      placeholder="Search satellites..."
                      value={satelliteSearch}
                      onChange={(e) => setSatelliteSearch(e.target.value)}
                      className="bg-[#2a3749]"
                    />
                    <Select
                      value={ownerFilter}
                      onValueChange={setOwnerFilter}
                    >
                      <SelectTrigger className="bg-[#2a3749]">
                        <SelectValue placeholder="Filter by Owner" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a3749]">
                        <SelectItem value="all">All Owners</SelectItem>
                        {uniqueOwners.map(owner => (
                          <SelectItem key={owner} value={owner}>
                            {owner}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {isLoadingSatellites ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-400">Loading satellites...</p>
                      </div>
                    ) : satellitesError ? (
                      <div className="p-4 text-center text-red-400">
                        {satellitesError}
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={() => window.location.reload()}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : filteredSatellites.length > 0 ? (
                      filteredSatellites.map((satellite) => (
                        <SelectItem 
                          key={satellite.id} 
                          value={satellite.norad_id.toString()}
                          className="hover:bg-[#2a3749]"
                        >
                          <div className="flex flex-col py-1">
                            <span className="font-medium">{satellite.name}</span>
                            <span className="text-sm text-gray-400">
                              NORAD: {satellite.norad_id} | Owner: {satellite.owner}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        No satellites found
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Suspense fallback={<HealthMonitoringLoading />}>
          <MotionDiv
            className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex' }}
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
                  <div className="font-medium">{healthData.name}</div>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">Last Updated</div>
                  <div className="font-medium">{new Date(healthData.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </MotionDiv>

          {/* Summary Cards - now with 4 cards */}
          <MotionDiv
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: 'grid' }}
          >
            {/* Health Status Card */}
            <Card className={cn(
              "overflow-hidden border-l-4",
              healthData.prediction === 1 ? "border-l-green-500" : "border-l-red-500"
            )}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Health Status</CardTitle>
                <div className={cn(
                  "rounded-full p-1",
                  healthData.prediction === 1 
                    ? "bg-green-100 dark:bg-green-900/20" 
                    : "bg-red-100 dark:bg-red-900/20"
                )}>
                  <Zap className={cn(
                    "h-4 w-4",
                    healthData.prediction === 1 ? "text-green-500" : "text-red-500"
                  )} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {healthData.prediction === 1 ? "Healthy" : "Attention Needed"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Since Launch Card */}
            <Card className="overflow-hidden border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Time Since Launch</CardTitle>
                <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
                  <Rocket className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthData.metrics.time_since_launch.value}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Total Days: {healthData.metrics.time_since_launch.days ?? 0}
                </div>
              </CardContent>
            </Card>

            {/* New Confidence Level Card */}
            <Card className="overflow-hidden border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
                <div className="rounded-full bg-purple-100 p-1 dark:bg-purple-900/20">
                  <Signal className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {Math.max(0, Math.min(100, (healthData.probability * 100) - 2)).toFixed(1)}%
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, (healthData.probability * 100) - 2))} 
                    className="flex-1" 
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Prediction confidence level
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          {/* Metrics Grid */}
          <MotionDiv
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'grid' }}
          >
            {filteredMetrics.length > 0 ? (
              filteredMetrics.map(([key, metric]) => (
                <MetricCard key={key} metricKey={key} metric={metric} onClick={handleMetricClick} />
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
          </MotionDiv>
        </Suspense>
      </main>

      {/* Detailed Metric Dialog */}
      {selectedMetric && healthData?.metrics[selectedMetric] && (
        <DetailedMetricDialog
          metricKey={selectedMetric}
          metric={healthData.metrics[selectedMetric]}
          open={detailedMetricOpen}
          onOpenChange={setDetailedMetricOpen}
        />
      )}
    </div>
  )
}