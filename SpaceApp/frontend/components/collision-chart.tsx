"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCollisionTimeline, type TimelineData } from "@/lib/collision-service"
import { AlertTriangle } from "lucide-react"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface CollisionChartProps {
  timeRange: string;
}

export function CollisionChart({ timeRange }: CollisionChartProps) {
  const [data, setData] = useState<TimelineData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const timelineData = await fetchCollisionTimeline()
        
        // Filter data based on time range
        const now = new Date()
        const filteredData = filterDataByTimeRange(timelineData, timeRange, now)
        
        setData(filteredData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load timeline data")
        console.error("Error loading timeline data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [timeRange]) // Reload when time range changes

  // Filter data based on selected time range
  const filterDataByTimeRange = (data: TimelineData, range: string, now: Date): TimelineData => {
    const ranges = {
      '24h': 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      '7d': 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      '30d': 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    }

    const timeLimit = now.getTime() - (ranges[range as keyof typeof ranges] || ranges['7d'])
    
    const filteredIndices = data.labels
      .map((label, index) => ({ label, index }))
      .filter(({ label }) => new Date(label).getTime() >= timeLimit)
      .map(({ index }) => index)

    return {
      labels: filteredIndices.map(i => data.labels[i]),
      highRisk: filteredIndices.map(i => data.highRisk[i]),
      mediumRisk: filteredIndices.map(i => data.mediumRisk[i]),
      lowRisk: filteredIndices.map(i => data.lowRisk[i]),
      total: filteredIndices.map(i => data.total[i]),
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-500 font-medium">Failed to load timeline data</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <p className="text-muted-foreground">No timeline data available</p>
      </div>
    )
  }

  // Format the time labels based on the selected time range
  const formattedLabels = data.labels.map(label => {
    const date = new Date(label)
    if (timeRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (timeRange === '7d') {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  })

  const chartData = {
    labels: formattedLabels,
    datasets: [
      {
        label: "High Risk",
        data: data.highRisk,
        borderColor: "rgb(239, 68, 68)", // red-500
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Medium Risk",
        data: data.mediumRisk,
        borderColor: "rgb(234, 179, 8)", // yellow-500
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Low Risk",
        data: data.lowRisk,
        borderColor: "rgb(34, 197, 94)", // green-500
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Total Events",
        data: data.total,
        borderColor: "rgb(59, 130, 246)", // blue-500
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        borderDash: [5, 5],
      },
    ],
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgb(156, 163, 175)", // gray-400
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)", // bg-[#0f1520] with opacity
        titleColor: "rgb(255, 255, 255)",
        bodyColor: "rgb(255, 255, 255)",
        borderColor: "rgb(30, 41, 59)", // border-[#1e2a41]
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          title: (items) => {
            if (!items.length) return ""
            const date = new Date(data.labels[items[0].dataIndex])
            if (timeRange === '24h') {
              return date.toLocaleString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            } else if (timeRange === '7d') {
              return date.toLocaleString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            } else {
              return date.toLocaleString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            }
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(30, 41, 59, 0.2)", // border-[#1e2a41] with opacity
        },
        ticks: {
          color: "rgb(156, 163, 175)", // gray-400
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: timeRange === '24h' ? 12 : timeRange === '7d' ? 7 : 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(30, 41, 59, 0.2)", // border-[#1e2a41] with opacity
        },
        ticks: {
          color: "rgb(156, 163, 175)", // gray-400
          precision: 0,
        },
      },
    },
  }

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}
