"use client"

import { useState } from "react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { LineChart } from "@/components/line-chart"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Bell, Download, Share2 } from "lucide-react"

export default function DashboardPage() {
  const [batteryThreshold, setBatteryThreshold] = useState(50)
  const [powerThreshold, setPowerThreshold] = useState(50)
  const [communicationThreshold, setCommunicationThreshold] = useState(50)

  const batteryData = {
    labels: ["5 AM", "7 AM", "9 AM", "11 AM", "1 PM", "3 PM"],
    datasets: [
      {
        label: "Battery Health",
        data: [95, 92, 90, 88, 87, 85],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
    ],
  }

  const historyData = {
    labels: ["5 AM", "7 AM", "9 AM", "11 AM", "1 PM", "3 PM"],
    datasets: [
      {
        label: "Battery Health",
        data: [100, 98, 97, 95, 94, 92],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
    ],
  }

  const handleSaveAlerts = () => {
    toast({
      title: "Alerts Saved",
      description: "Your alert thresholds have been updated.",
    })
  }

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
            >
              <div className="w-4 h-4 bg-[#0f1520]"></div>
            </motion.div>
            <span className="font-bold text-lg gradient-text">Orbital</span>
          </Link>
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold fancy-title">Satellite 1A</h1>
          <p className="text-gray-400">Launched 3 years ago ~ Last checked 5 minutes ago</p>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold mb-4 gradient-text">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                className="dashboard-card"
                whileHover={{ y: -5, boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="dashboard-card-header">
                  <div className="text-sm text-gray-400 mb-1">Total Health Score</div>
                </div>
                <div className="dashboard-card-content">
                  <div className="text-3xl font-bold text-green-400 glow-text-green">92</div>
                  <div className="text-xs text-green-400 mt-1">+2% from last week</div>
                </div>
              </motion.div>

              <motion.div
                className="dashboard-card"
                whileHover={{ y: -5, boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="dashboard-card-header">
                  <div className="text-sm text-gray-400 mb-1">Communication Health</div>
                </div>
                <div className="dashboard-card-content">
                  <div className="text-3xl font-bold text-green-400 glow-text-green">100</div>
                  <div className="text-xs text-green-400 mt-1">Excellent signal strength</div>
                </div>
              </motion.div>

              <motion.div
                className="dashboard-card"
                whileHover={{ y: -5, boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="dashboard-card-header">
                  <div className="text-sm text-gray-400 mb-1">Power Health</div>
                </div>
                <div className="dashboard-card-content">
                  <div className="text-3xl font-bold text-yellow-400 glow-text-yellow">85</div>
                  <div className="text-xs text-yellow-400 mt-1">-5% from last week</div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold gradient-text">Predictive Analytics</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 hover:bg-[#1a2234] hover:border-[#3b82f6]"
                  onClick={() =>
                    toast({ title: "Data Downloaded", description: "Analytics data has been downloaded." })
                  }
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 hover:bg-[#1a2234] hover:border-[#3b82f6]"
                  onClick={() => toast({ title: "Report Shared", description: "Analytics report has been shared." })}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
            <motion.div
              className="dashboard-card"
              whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-2">
                <div className="text-sm text-gray-400">Battery Health</div>
                <div className="ml-auto flex items-center">
                  <span className="text-2xl font-bold">85%</span>
                  <span className="ml-2 text-sm text-red-400">-10%</span>
                </div>
              </div>
              <div className="h-64">
                <LineChart data={batteryData} />
              </div>
            </motion.div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-4 gradient-text">History</h2>
            <motion.div
              className="dashboard-card"
              whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-2">
                <div className="text-sm text-gray-400">Battery Health</div>
                <div className="ml-auto">
                  <span className="text-2xl font-bold">95%</span>
                </div>
              </div>
              <div className="h-64">
                <LineChart data={historyData} />
              </div>
            </motion.div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold gradient-text">Alerts</h2>
              <Button
                variant="outline"
                size="sm"
                className="h-8 hover:bg-[#1a2234] hover:border-[#3b82f6]"
                onClick={() => toast({ title: "Notifications", description: "You have 3 unread notifications" })}
              >
                <Bell className="h-4 w-4 mr-1" />
                Notifications
              </Button>
            </div>
            <div className="space-y-4">
              <motion.div
                className="dashboard-card"
                whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Battery Health</div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="text-xs text-gray-400 mb-2">Notify me when the battery health is below</div>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={batteryThreshold}
                    onChange={(e) => setBatteryThreshold(Number.parseInt(e.target.value))}
                    className="custom-slider flex-1"
                  />
                  <span className="ml-4 text-sm">{batteryThreshold}%</span>
                </div>
              </motion.div>

              <motion.div
                className="dashboard-card"
                whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Power Health</div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="text-xs text-gray-400 mb-2">Notify me when the power health is below</div>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={powerThreshold}
                    onChange={(e) => setPowerThreshold(Number.parseInt(e.target.value))}
                    className="custom-slider flex-1"
                  />
                  <span className="ml-4 text-sm">{powerThreshold}%</span>
                </div>
              </motion.div>

              <motion.div
                className="dashboard-card"
                whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Communication Health</div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="text-xs text-gray-400 mb-2">Notify me when the communication health is below</div>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={communicationThreshold}
                    onChange={(e) => setCommunicationThreshold(Number.parseInt(e.target.value))}
                    className="custom-slider flex-1"
                  />
                  <span className="ml-4 text-sm">{communicationThreshold}%</span>
                </div>
              </motion.div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button className="fancy-button" onClick={handleSaveAlerts}>
                Save Alerts
              </Button>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}
