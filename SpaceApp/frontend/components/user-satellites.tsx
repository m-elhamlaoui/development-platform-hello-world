"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Satellite, Rocket, Activity, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import axios from 'axios'
import { authService } from '@/lib/auth-service'

interface Satellite {
  id: string
  name: string
  norad_id: number
  launchDate: string
  launchSite: string
  popular: string
  owner: string
}

interface UserSatellitesProps {
  userEmail?: string
}

const satelliteCache = new Map<string, { data: Satellite[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function UserSatellites({ userEmail }: UserSatellitesProps) {
  const [satellites, setSatellites] = useState<Satellite[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(userEmail || null)

  // Fetch user's email if not provided
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!email) {
        try {
          const userData = await authService.getCurrentUser()
          setEmail(userData.email)
        } catch (err) {
          setError('Failed to fetch user data')
          console.error('Error fetching user data:', err)
        }
      }
    }

    fetchUserEmail()
  }, [email])

  // Fetch user's satellites
  useEffect(() => {
    const fetchUserSatellites = async () => {
      if (!email) return

      try {
        setLoading(true)
        const cachedData = satelliteCache.get(email)
        const now = Date.now()
        
        if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
          setSatellites(cachedData.data)
          setLoading(false)
          return
        }

        const response = await axios.get(`http://localhost:8080/api/v1/users/stallitesTrackeByUser/${email}`, {
          timeout: 3000,
        })

        if (response.status !== 200) {
          throw new Error('Failed to fetch satellites')
        }

        const data = response.data
        setSatellites(data)
        setError(null)
        satelliteCache.set(email, { data, timestamp: now })
      } catch (err) {
        setError('Failed to load satellites. Please try again.')
        console.error('Error fetching satellites:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserSatellites()
  }, [email])

  // Memoize filtered satellites
  const filteredSatellites = useMemo(() => {
    return satellites.filter((satellite) =>
      satellite.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [satellites, searchQuery])

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search your satellites..."
          className="pl-9 bg-[#1a2234] border-[#1e2a41] text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-8">
          {error}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : filteredSatellites.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <Satellite className="h-12 w-12 mx-auto mb-3 text-gray-500" />
          <p>No satellites found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-auto max-h-[calc(100vh-12rem)]">
          {filteredSatellites.map((satellite) => (
            <motion.div
              key={satellite.id}
              className="w-full p-3 text-left transition-colors hover:bg-[#1a2234] border border-[#1e2a41] rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{satellite.name}</h3>
                  <p className="text-sm text-gray-400">
                    NORAD ID: {satellite.norad_id} • {satellite.owner}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Launched: {satellite.launchDate} • Site: {satellite.launchSite}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {satellite.popular === "yes" && (
                    <span className="px-2 py-1 text-xs bg-[#3b82f6] text-white rounded-full">
                      Popular
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
} 