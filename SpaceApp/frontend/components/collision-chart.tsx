"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

export function CollisionChart() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")

      // Create gradient for the chart background
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)")
      gradient.addColorStop(1, "rgba(59, 130, 246, 0)")

      // Sample data
      const data = {
        labels: ["May 5", "May 6", "May 7", "May 8", "May 9", "May 10", "May 11"],
        datasets: [
          {
            label: "High Risk Events",
            data: [2, 3, 1, 2, 0, 1, 2],
            borderColor: "rgba(239, 68, 68, 1)",
            backgroundColor: "rgba(239, 68, 68, 0.5)",
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "rgba(239, 68, 68, 1)",
            pointBorderColor: "rgba(255, 255, 255, 0.8)",
            pointBorderWidth: 2,
            stack: "combined",
            type: "bar",
          },
          {
            label: "Medium Risk Events",
            data: [4, 3, 5, 2, 3, 4, 3],
            borderColor: "rgba(245, 158, 11, 1)",
            backgroundColor: "rgba(245, 158, 11, 0.5)",
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "rgba(245, 158, 11, 1)",
            pointBorderColor: "rgba(255, 255, 255, 0.8)",
            pointBorderWidth: 2,
            stack: "combined",
            type: "bar",
          },
          {
            label: "Low Risk Events",
            data: [8, 7, 6, 9, 10, 8, 7],
            borderColor: "rgba(16, 185, 129, 1)",
            backgroundColor: "rgba(16, 185, 129, 0.5)",
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "rgba(16, 185, 129, 1)",
            pointBorderColor: "rgba(255, 255, 255, 0.8)",
            pointBorderWidth: 2,
            stack: "combined",
            type: "bar",
          },
          {
            label: "Total Events",
            data: [14, 13, 12, 13, 13, 13, 12],
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "transparent",
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: "rgba(59, 130, 246, 1)",
            pointBorderColor: "rgba(255, 255, 255, 0.8)",
            pointBorderWidth: 2,
            type: "line",
          },
        ],
      }

      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          scales: {
            x: {
              grid: {
                color: "rgba(255, 255, 255, 0.05)",
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.7)",
                font: {
                  size: 10,
                },
              },
            },
            y: {
              stacked: true,
              grid: {
                color: "rgba(255, 255, 255, 0.05)",
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.7)",
                font: {
                  size: 10,
                },
              },
              title: {
                display: true,
                text: "Number of Events",
                color: "rgba(255, 255, 255, 0.7)",
                font: {
                  size: 11,
                },
              },
            },
          },
          plugins: {
            tooltip: {
              backgroundColor: "rgba(13, 18, 30, 0.9)",
              titleColor: "white",
              bodyColor: "white",
              borderColor: "rgba(59, 130, 246, 0.5)",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
            legend: {
              labels: {
                color: "rgba(255, 255, 255, 0.7)",
                font: {
                  size: 11,
                },
                boxWidth: 15,
                padding: 15,
              },
              title: {
                display: false,
                text: "Collision Risk Timeline",
                color: "rgba(255, 255, 255, 0.9)",
                font: {
                  size: 12,
                  weight: "bold",
                },
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
  }, [])

  return <canvas ref={chartRef} />
}
