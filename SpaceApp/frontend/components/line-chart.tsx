"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

interface LineChartProps {
  data: any; // Replace with proper Chart.js data type if known
}

export function LineChart({ data }: LineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      if (!ctx) return

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: {
              tension: 0.4, // Smoother curves
            },
            point: {
              radius: 0, // Hide points
            },
          },
          scales: {
            x: {
              grid: {
                color: "rgba(255, 255, 255, 0.05)",
              },
              border: {
                display: false
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.5)",
                font: {
                  size: 10,
                },
              },
            },
            y: {
              grid: {
                color: "rgba(255, 255, 255, 0.05)",
              },
              border: {
                display: false
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.5)",
                font: {
                  size: 10,
                },
                padding: 10,
              },
              beginAtZero: false,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              titleColor: "white",
              bodyColor: "white",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: (context) => context.parsed.y.toString(),
              },
            },
          },
        },
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}
