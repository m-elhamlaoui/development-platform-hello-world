"use client"

import { X, Calendar, Ruler, Globe, Activity, AlertTriangle, Download, Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function SatelliteModal({ satellite, onClose, onViewDetails }) {
  const router = useRouter();
  if (!satellite) return null

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-400"
      case "Inactive":
        return "text-gray-400"
      case "Warning":
        return "text-yellow-400"
      case "Critical":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const handleDownload = () => {
    toast({
      title: "Downloading Data",
      description: `Satellite data for ${satellite.name} is being prepared for download.`,
    })
  }

  const handleShare = () => {
    toast({
      title: "Share Satellite",
      description: "Sharing options opened",
    })
  }

  const handleTrack = () => {
    toast({
      title: "Tracking Enabled",
      description: `Now tracking ${satellite.name} in real-time.`,
    })
    onClose()
  }

  const handleHealthMonitoring = () => {
    router.push(`/health-monitoring?satelliteId=${satellite.id}`);
    onClose();
  };

  // Calculate orbital period based on altitude and orbit type
  const getOrbitalPeriod = () => {
    // Extract numeric value from altitude string
    const altMatch = satellite.altitude.match(/(\d+)/)
    if (!altMatch) return "Unknown"

    const altValue = Number.parseInt(altMatch[0])

    if (satellite.orbitType === "Geostationary") {
      return "24 hours" // Geostationary orbits have a 24-hour period
    } else if (satellite.orbitType === "Medium Earth Orbit") {
      return "12 hours" // Approximate for MEO
    } else if (satellite.orbitType === "Low Earth Orbit") {
      // Calculate approximate period for LEO
      const period = Math.round(90 + (altValue - 400) / 50)
      return `${period} minutes`
    } else if (satellite.orbitType === "Sun-synchronous") {
      return "100 minutes" // Approximate for SSO
    }

    return "Unknown"
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#131c2e] border border-[#1e2a41] rounded-lg w-full max-w-md overflow-hidden fancy-card"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="relative p-4 border-b border-[#1e2a41]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 hover:bg-[#1a2234] hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-[#1a2234] p-0 rounded-none">
            <TabsTrigger
              value="overview"
              className="rounded-none data-[state=active]:bg-[#131c2e] data-[state=active]:shadow-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="telemetry"
              className="rounded-none data-[state=active]:bg-[#131c2e] data-[state=active]:shadow-none"
            >
              Telemetry
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none data-[state=active]:bg-[#131c2e] data-[state=active]:shadow-none"
            >
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-4 space-y-4 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start">
                <Calendar className="h-4 w-4 text-[#3b82f6] mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Launch Date</p>
                  <p className="font-medium">{satellite?.launchDate}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Ruler className="h-4 w-4 text-[#3b82f6] mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Altitude</p>
                  <p className="font-medium">{satellite?.altitude}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Globe className="h-4 w-4 text-[#3b82f6] mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Orbit Type</p>
                  <p className="font-medium">{satellite?.orbitType}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Activity className="h-4 w-4 text-[#3b82f6] mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="font-medium">{satellite.status}</p>
                </div>
              </div>
            </div>

            <div className="fancy-divider"></div>

            <div>
              <h3 className="text-sm text-gray-400 mb-1 flex items-center">
                <AlertTriangle className="h-4 w-4 text-[#3b82f6] mr-2" />
                Description
              </h3>
              <p className="text-sm">{satellite?.description}</p>
            </div>

            <div className="fancy-divider"></div>

            <div>
              <h3 className="text-sm text-gray-400 mb-1 flex items-center">
                <Activity className="h-4 w-4 text-[#3b82f6] mr-2" />
                Orbital Period
              </h3>
              <p className="text-sm">{getOrbitalPeriod()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Signal Strength</p>
                <div className="mt-1 fancy-progress">
                  <div className="fancy-progress-bar" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Battery Health</p>
                <div className="mt-1 fancy-progress">
                  <div className="fancy-progress-bar" style={{ width: "92%" }}></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="telemetry" className="p-4 space-y-4 mt-0">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Current Position</p>
                <p className="font-medium">Lat: 32.7157°N, Long: 117.1611°W</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Velocity</p>
                <p className="font-medium">7.8 km/s</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Temperature</p>
                <p className="font-medium">-15°C to +45°C (operational range)</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Power Consumption</p>
                <p className="font-medium">1.2 kW</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Last Communication</p>
                <p className="font-medium">2 minutes ago</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Signal Quality</p>
                <div className="mt-1 fancy-progress">
                  <div className="fancy-progress-bar" style={{ width: "78%" }}></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-4 space-y-4 mt-0">
            <div className="space-y-4">
              <div className="timeline-item">
                <h4 className="text-sm font-medium">Launch</h4>
                <p className="text-xs text-gray-400">{satellite.launchDate}</p>
                <p className="text-xs mt-1">Successfully deployed into orbit</p>
              </div>

              <div className="timeline-item">
                <h4 className="text-sm font-medium">First Signal</h4>
                <p className="text-xs text-gray-400">1 day after launch</p>
                <p className="text-xs mt-1">First communication established</p>
              </div>

              <div className="timeline-item">
                <h4 className="text-sm font-medium">Full Operation</h4>
                <p className="text-xs text-gray-400">1 week after launch</p>
                <p className="text-xs mt-1">All systems online and operational</p>
              </div>

              <div className="timeline-item">
                <h4 className="text-sm font-medium">Latest Update</h4>
                <p className="text-xs text-gray-400">Today</p>
                <p className="text-xs mt-1">Routine maintenance completed</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex space-x-2 p-4 border-t border-[#1e2a41]">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:bg-[#1a2234] hover:border-[#3b82f6]"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:bg-[#1a2234] hover:border-[#3b82f6]"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex space-x-2 ml-auto">
            <Button variant="outline" onClick={onClose} className="hover:bg-[#1a2234] hover:border-[#3b82f6]">
              Close
            </Button>
            <Button 
              className="fancy-button flex items-center gap-2" 
              onClick={handleHealthMonitoring}
            >
              <Heart className="h-4 w-4" />
              Health Monitoring
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
