"use client"

import { MotionDiv } from "@/components/ui/motion"

export default function HealthMonitoringLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1520] text-white p-6">
      <div className="w-full max-w-6xl space-y-6">
        {/* Header Skeleton */}
        <div className="h-16 bg-[#1a2234] rounded-lg animate-pulse mb-8"></div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <MotionDiv
              key={i}
              className="h-32 bg-[#1a2234] rounded-lg animate-pulse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <MotionDiv
              key={i}
              className="h-48 bg-[#1a2234] rounded-lg animate-pulse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
