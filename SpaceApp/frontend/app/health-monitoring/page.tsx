"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { motion, HTMLMotionProps } from "framer-motion"
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
import { UserNav } from "@/components/user-nav";
import { getLatestHealthStatus, getHistoricalHealthData } from '../../services/health/getHealth';
import { cn } from "@/lib/utils"
import { useSearchParams, useRouter } from 'next/navigation'
import { useSatellites } from "@/hooks/useSatellites"

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

interface DetailedMetricDialogProps {
  metricKey: string;
  metric: Metric;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

// Detailed Metric Dialog component
const DetailedMetricDialog = ({ metricKey, metric, open, onOpenChange }: DetailedMetricDialogProps) => {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("1h");
  const [historicalData, setHistoricalData] = useState<{ 
    labels: string[], 
    data: number[],
    availableRanges?: AvailableRanges
  }>({ labels: [], data: [] });
  const [isLoading, setIsLoading] = useState(false);

  const shouldShowGraph = metricKey !== 'time_since_launch';

  const timeRangeOptions: Array<{ value: TimeRangeOption; label: string }> = [
    { value: "1h", label: "Last Hour" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" }
  ];

  // Set initial time range based on available data
  useEffect(() => {
    if (historicalData.availableRanges) {
      const ranges: TimeRangeOption[] = ["30d", "7d", "24h", "1h"];
      const firstAvailableRange = ranges.find(range => historicalData.availableRanges?.[range]);
      if (firstAvailableRange && firstAvailableRange !== timeRange) {
        setTimeRange(firstAvailableRange);
      }
    }
  }, [historicalData.availableRanges]);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching historical data for ${metricKey} with range ${timeRange}`);
        const response = await getHistoricalHealthData(48272, metricKey, timeRange);
        
        // Transform the API response into chart data
        const labels = response.timestamps.map((timestamp: string) => 
          format(new Date(timestamp), 
            timeRange === "1h" || timeRange === "24h" ? "HH:mm" : "MMM dd")
        );
        
        console.log('Processed historical data:', {
          timestamps: response.timestamps.length,
          values: response.values.length,
          labels: labels.length,
          availableRanges: response.availableRanges,
          sampleData: response.values.slice(0, 3)
        });

        setHistoricalData({
          labels,
          data: response.values,
          availableRanges: response.availableRanges
        });
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
        toast({
          title: "Error",
          description: "Failed to load historical data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchHistoricalData();
    }
  }, [timeRange, metricKey, open]);

  const chartData = {
    labels: historicalData.labels,
    datasets: [
      {
        label: formatMetricName(metricKey),
        data: historicalData.data,
        borderColor:
          metric.status === "critical"
            ? "#F87171"
            : metric.status === "warning"
              ? "#FBBF24"
              : "#34D399",
        backgroundColor:
          metric.status === "critical"
            ? "rgba(248, 113, 113, 0.1)"
            : metric.status === "warning"
              ? "rgba(251, 191, 36, 0.1)"
              : "rgba(52, 211, 153, 0.1)",
      },
    ],
  };

  console.log('Rendering graph with data:', {
    hasData: historicalData.data.length > 0,
    dataLength: historicalData.data.length,
    isLoading,
    timeRange,
    chartData
  });

  const handleDownload = () => {
    try {
      // Create CSV content with proper date formatting
      const csvRows = [
        ['Timestamp', formatMetricName(metricKey)],
        ...historicalData.labels.map((label, index) => [
          new Date(historicalData.data[index]).toISOString(),
          historicalData.data[index].toString()
        ])
      ];
      
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${formatMetricName(metricKey)}_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `Historical data for ${formatMetricName(metricKey)} has been downloaded.`,
      });
    } catch (error) {
      console.error('Failed to download data:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the data. Please try again.",
        variant: "destructive",
      });
    }
  };

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

          {shouldShowGraph && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Select time range:</div>
                <Select 
                  value={timeRange} 
                  onValueChange={(value: TimeRangeOption) => setTimeRange(value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRangeOptions.map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={!historicalData.availableRanges?.[option.value]}
                      >
                        {option.label}
                        {historicalData.availableRanges && !historicalData.availableRanges[option.value] && 
                          " (No data)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-[300px] w-full relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : historicalData.data.length > 0 ? (
                  <LineChart data={chartData} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">
                      {historicalData.availableRanges?.[timeRange] 
                        ? "No data points available for this time range" 
                        : "Selected time range is not available"}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

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
                      <div className={`font-mono ${getStatusColor(level as MetricStatus)}`}>
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
          {shouldShowGraph && (
            <Button 
              variant="outline" 
              onClick={handleDownload}
              disabled={historicalData.data.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Data
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

// Add type for motion components
type MotionDivProps = HTMLMotionProps<"div">;

export default function HealthMonitoringPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [satelliteSearch, setSatelliteSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [satellitePrimaryData, setSatellitePrimaryData] = useState<SatelliteData | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [detailedMetricOpen, setDetailedMetricOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [overallHealth, setOverallHealth] = useState<number>(100)

  // Replace the satellites state with our custom hook
  /* const { 
    satellites, 
    isLoading: isLoadingSatellites, 
    error: satellitesError,
    uniqueOwners 
  } = useSatellites(); */

  // Memoize filtered satellites based on search and owner filter
  

  const [isLoadingSatellites, setIsLoadingSatellites] = useState(true);
const [satellitesError, setSatellitesError]   = useState<string | null>(null);


  const STORAGE_KEY = "satellite_data"
  const [satellites, setSatellites] = useState<Satellite[]>([]);

  useEffect(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setSatellites(JSON.parse(raw));
    }
  } catch (err) {
    console.error("Failed to parse cached satellites", err);
    setSatellitesError("Could not load your tracked satellites.");
  } finally {
    setIsLoadingSatellites(false);
  }
}, []);

   const uniqueOwners = useMemo(
   () => Array.from(new Set(satellites.map(s => s.owner))),
    [satellites]
  );

  const filteredSatellites = useMemo(() => {
    return satellites.filter(sat => {
      const matchesSearch = sat.name.toLowerCase().includes(satelliteSearch.toLowerCase()) ||
                          sat.norad_id.toString().includes(satelliteSearch);
      const matchesOwner = ownerFilter === "all" || sat.owner === ownerFilter;
      return matchesSearch && matchesOwner;
    });
  }, [satellites, satelliteSearch, ownerFilter]); 

  // Update parameter name to match API routes
  const norad_id = Number(searchParams?.get('norad_id')) || 48272;

  // Update the satellite selection handler
  const handleSatelliteSelect = (selectedNoradId: number) => {
    router.push(`/health-monitoring?norad_id=${selectedNoradId}`);
  };

  // Update the data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const raw = await getLatestHealthStatus(norad_id);
        console.log('data : ', raw);
        const transformed: SatelliteData = {
          id: raw.noradId,
          name: raw.satelliteName,
          timestamp: raw.timestamp,
          prediction: raw.prediction,
          probability: raw.probability,
          metrics: {
            time_since_launch: {
              value: formatTimeSinceLaunch(raw.timeSinceLaunch),
              days: raw.timeSinceLaunch,
              status: "normal" as MetricStatus,
              history: generateMockHistory(raw.timeSinceLaunch, 7, 0.001)
            },
            orbital_altitude: {
              value: raw.orbitalAltitude,
              unit: "km",
              status: "normal" as MetricStatus,
              history: generateMockHistory(raw.orbitalAltitude)
            },
            battery_voltage: {
              value: raw.batteryVoltage,
              unit: "V",
              status: getStatus(raw.batteryVoltage, { normal: [26, 30], warning: [24, 26], critical: [0, 24] }) as MetricStatus,
              thresholds: { normal: [26, 30], warning: [24, 26], critical: [0, 24] },
              history: generateMockHistory(raw.batteryVoltage)
            },
            solar_panel_temperature: {
              value: raw.solarPanelTemperature,
              unit: "°C",
              status: getStatus(raw.solarPanelTemperature, { normal: [0, 50], warning: [50, 70], critical: [70, 100] }) as MetricStatus,
              thresholds: { normal: [0, 50], warning: [50, 70], critical: [70, 100] },
              history: generateMockHistory(raw.solarPanelTemperature)
            },
            attitude_control_error: {
              value: raw.attitudeControlError,
              unit: "°",
              status: getStatus(raw.attitudeControlError, { normal: [0, 0.05], warning: [0.05, 0.1], critical: [0.1, 1] }) as MetricStatus,
              thresholds: { normal: [0, 0.05], warning: [0.05, 0.1], critical: [0.1, 1] },
              history: generateMockHistory(raw.attitudeControlError)
            },
            data_transmission_rate: {
              value: raw.dataTransmissionRate,
              unit: "Mbps",
              status: "normal" as MetricStatus,
              trend: "stable" as TrendDirection,
              history: generateMockHistory(raw.dataTransmissionRate)
            },
            thermal_control_status: {
              value: raw.thermalControlStatus === 1 ? "NORMAL" : "OVERHEATING",
              status: raw.thermalControlStatus === 1 ? "normal" as MetricStatus : "warning" as MetricStatus,
              history: Array(7).fill(raw.thermalControlStatus === 1 ? "NORMAL" : "OVERHEATING")
            }
          }
        };
        
        setSatellitePrimaryData(transformed);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to fetch satellite health:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3600000); // every hour

    return () => clearInterval(interval);
  }, [norad_id]);

  // Calculate overall health percentage when data changes
  useEffect(() => {
    if (!satellitePrimaryData) return;
    const metrics = Object.values(satellitePrimaryData.metrics);
    const normalCount = metrics.filter((m) => m.status === "normal").length;
    const percentage = Math.round((normalCount / metrics.length) * 100);
    setOverallHealth(percentage);
  }, [satellitePrimaryData]);

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

  // GUARD: Wait for data to load
  if (!satellitePrimaryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1520] text-white">
        <div className="animate-spin h-12 w-12 mb-4 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <h2 className="text-lg">Loading satellite health data...</h2>
      </div>
    )
  }

  // Filter metrics based on search and status filter, excluding time_since_launch from the grid
  const filteredMetrics = Object.entries(satellitePrimaryData.metrics).filter(([key, metric]) => {
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
            <motion.div
              className="w-8 h-8 bg-white rounded mr-2 flex items-center justify-center"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex' }}
            >
              <div className="w-4 h-4 bg-[#0f1520]"></div>
            </motion.div>
            <span className="font-bold text-lg gradient-text">Orbital</span>
          </Link>
          <MainNav />
          
          {/* Updated Satellite Selector */}
          <div className="flex-1 flex items-center justify-end space-x-4">
            <div className="w-[300px]">
              <Select
                value={norad_id.toString()}
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
        <motion.div
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
                <div className="font-medium">{satellitePrimaryData.name}</div>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Last Updated</div>
                <div className="font-medium">{new Date(satellitePrimaryData.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards - now with 4 cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'grid' }}
        >
          {/* Health Status Card */}
          <Card className={cn(
            "overflow-hidden border-l-4",
            satellitePrimaryData.prediction === 1 ? "border-l-green-500" : "border-l-red-500"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              <div className={cn(
                "rounded-full p-1",
                satellitePrimaryData.prediction === 1 
                  ? "bg-green-100 dark:bg-green-900/20" 
                  : "bg-red-100 dark:bg-red-900/20"
              )}>
                <Zap className={cn(
                  "h-4 w-4",
                  satellitePrimaryData.prediction === 1 ? "text-green-500" : "text-red-500"
                )} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {satellitePrimaryData.prediction === 1 ? "Healthy" : "Attention Needed"}
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
                {satellitePrimaryData.metrics.time_since_launch.value}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Total Days: {satellitePrimaryData.metrics.time_since_launch.days ?? 0}
              </div>
            </CardContent>
          </Card>

          {/* Overall Health Card */}
          <Card className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
              <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
                <Activity className="h-4 w-4 text-blue-500" />
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
                  {Math.max(0, Math.min(100, (satellitePrimaryData.probability * 100) - 2)).toFixed(1)}%
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, (satellitePrimaryData.probability * 100) - 2))} 
                  className="flex-1" 
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Prediction confidence level
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
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
        </motion.div>
      </main>

      {/* Detailed Metric Dialog */}
      {selectedMetric && satellitePrimaryData?.metrics[selectedMetric] && (
        <DetailedMetricDialog
          metricKey={selectedMetric}
          metric={satellitePrimaryData.metrics[selectedMetric]}
          open={detailedMetricOpen}
          onOpenChange={setDetailedMetricOpen}
        />
      )}
    </div>
  )
}
