"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { LineChart } from "@/components/line-chart"
import { getHistoricalHealthData } from '@/services/health/getHealth'
import { format } from 'date-fns'

interface DetailedMetricDialogProps {
  metricKey: string | null;
  metric: {
    value: number | string;
    unit?: string;
    status: 'normal' | 'warning' | 'critical';
    history?: (number | string)[];
    thresholds?: {
      normal: [number, number];
      warning: [number, number];
      critical: [number, number];
    };
  } | null;
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

export default function DetailedMetricDialog({ metricKey, metric, open, onOpenChange }: DetailedMetricDialogProps) {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("1h")
  const [historicalData, setHistoricalData] = useState<{ 
    labels: string[], 
    data: number[],
    availableRanges?: AvailableRanges
  }>({ labels: [], data: [] })
  const [isLoading, setIsLoading] = useState(false)

  const timeRangeOptions: Array<{ value: TimeRangeOption; label: string }> = [
    { value: "1h", label: "Last Hour" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" }
  ]

  useEffect(() => {
    if (historicalData.availableRanges) {
      const ranges: TimeRangeOption[] = ["30d", "7d", "24h", "1h"]
      const firstAvailableRange = ranges.find(range => historicalData.availableRanges?.[range])
      if (firstAvailableRange && firstAvailableRange !== timeRange) {
        setTimeRange(firstAvailableRange)
      }
    }
  }, [historicalData.availableRanges])

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!open) return
      
      setIsLoading(true)
      try {
        const response = await getHistoricalHealthData(48272, metricKey, timeRange)
        
        const labels = response.timestamps.map((timestamp: string) => 
          format(new Date(timestamp), 
            timeRange === "1h" || timeRange === "24h" ? "HH:mm" : "MMM dd")
        )
        
        setHistoricalData({
          labels,
          data: response.values,
          availableRanges: response.availableRanges
        })
      } catch (error) {
        console.error('Failed to fetch historical data:', error)
        toast({
          title: "Error",
          description: "Failed to load historical data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistoricalData()
  }, [timeRange, metricKey, open])

  const handleDownload = () => {
    try {
      const csvRows = [
        ['Timestamp', formatMetricName(metricKey)],
        ...historicalData.labels.map((label, index) => [
          new Date(historicalData.data[index]).toISOString(),
          historicalData.data[index].toString()
        ])
      ]
      
      const csvContent = csvRows.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${formatMetricName(metricKey)}_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Download Complete",
        description: `Historical data for ${formatMetricName(metricKey)} has been downloaded.`,
      })
    } catch (error) {
      console.error('Failed to download data:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download the data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatMetricName = (key: string | null): string => {
    if (!key) return '';
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getStatusColor = (status: 'normal' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'critical':
        return '#F87171' // red-400
      case 'warning':
        return '#FBBF24' // yellow-400
      case 'normal':
        return '#34D399' // green-400
      default:
        return '#9CA3AF' // gray-400
    }
  }

  const chartData = {
    labels: historicalData.labels,
    datasets: [
      {
        label: formatMetricName(metricKey),
        data: historicalData.data,
        borderColor: getStatusColor(metric?.status || 'normal'),
        backgroundColor: `${getStatusColor(metric?.status || 'normal')}20`,
      },
    ],
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{formatMetricName(metricKey)}</DialogTitle>
          <DialogDescription>Historical data and analysis</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {typeof metric?.value === "number" ? metric.value.toFixed(2) : metric?.value}
              {metric?.unit && <span className="ml-1 text-sm">{metric.unit}</span>}
            </div>
          </div>

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

          {metric?.thresholds && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Thresholds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metric.thresholds).map(([level, range]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="capitalize">{level}:</div>
                      <div className={`font-mono text-${level === 'normal' ? 'green' : level === 'warning' ? 'yellow' : 'red'}-400`}>
                        {range[0]} - {range[1]} {metric.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleDownload}
            disabled={historicalData.data.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 