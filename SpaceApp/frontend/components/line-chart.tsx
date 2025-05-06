"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

export function LineChart({ data }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")

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
                drawBorder: false,
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
                drawBorder: false,
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
                label: (context) => context.parsed.y,
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
