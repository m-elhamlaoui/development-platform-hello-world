"use client"

import { useState, useEffect } from 'react'
import { getLatestHealthStatus } from '@/services/health/getHealth'

export interface HealthData {
  id: number;
  name: string;
  timestamp: string;
  prediction: number;
  probability: number;
  metrics: {
    [key: string]: {
      value: number | string;
      unit?: string;
      status: 'normal' | 'warning' | 'critical';
      history?: (number | string)[];
      trend?: 'increasing' | 'decreasing' | 'stable';
      days?: number;
      thresholds?: {
        normal: [number, number];
        warning: [number, number];
        critical: [number, number];
      };
    };
  };
}

export function useHealthData(noradId: number) {
  const [data, setData] = useState<HealthData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        setIsLoading(true)
        const response = await getLatestHealthStatus(noradId)
        
        if (!isMounted) return

        // Transform the response into the expected format
        const transformedData: HealthData = {
          id: response.noradId,
          name: response.satelliteName,
          timestamp: response.timestamp,
          prediction: response.prediction,
          probability: response.probability,
          metrics: {
            time_since_launch: {
              value: response.timeSinceLaunch,
              days: response.timeSinceLaunch,
              status: "normal",
              history: Array(7).fill(response.timeSinceLaunch).map((v, i) => v - i)
            },
            orbital_altitude: {
              value: response.orbitalAltitude,
              unit: "km",
              status: "normal",
              history: Array(7).fill(response.orbitalAltitude).map(v => v + (Math.random() - 0.5) * 2)
            },
            battery_voltage: {
              value: response.batteryVoltage,
              unit: "V",
              status: response.batteryVoltage < 24 ? "critical" : response.batteryVoltage < 26 ? "warning" : "normal",
              thresholds: { normal: [26, 30], warning: [24, 26], critical: [0, 24] },
              history: Array(7).fill(response.batteryVoltage).map(v => v + (Math.random() - 0.5))
            },
            solar_panel_temperature: {
              value: response.solarPanelTemp || 0.08,
              unit: "°C",
              status: "normal",
              history: Array(7).fill(response.solarPanelTemp || 0.08).map(v => v + (Math.random() - 0.5) * 0.02)
            },
            attitude_control_error: {
              value: response.attitudeError || 4.79,
              unit: "°",
              status: "normal",
              history: Array(7).fill(response.attitudeError || 4.79).map(v => v + (Math.random() - 0.5) * 0.1)
            },
            data_transmission_rate: {
              value: response.dataRate || 47.42,
              unit: "Mbps",
              status: "normal",
              history: Array(7).fill(response.dataRate || 47.42).map(v => v + (Math.random() - 0.5) * 2)
            },
            thermal_control_status: {
              value: response.thermalStatus || "NORMAL",
              status: "normal",
              history: Array(7).fill("NORMAL")
            }
          }
        }

        setData(transformedData)
        setLastUpdated(new Date())
        setError(null)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to fetch health data')
        console.error('Failed to fetch health data:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(fetchData, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [noradId])

  // Function to manually refresh data
  const refresh = () => {
    setLastUpdated(new Date())
  }

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh
  }
} 