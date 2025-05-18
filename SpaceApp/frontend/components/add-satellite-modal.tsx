"use client"

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react"
import { motion } from "framer-motion"
import { X, Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useVirtualizer } from '@tanstack/react-virtual'
import debounce from 'lodash/debounce'
import axios from 'axios'
import Cookies from 'js-cookie'

interface Satellite {
  id: string
  name: string
  norad_id: number
  launchDate: string
  launchSite: string
  popular: string
  owner: string
}

interface AddSatelliteModalProps {
  onClose: () => void
  onAddSatellites: (satellites: Satellite[]) => void
  userEmail: string
  userId: string
}

const satelliteCache = new Map<string, { data: any[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const AddSatelliteModal = ({ onClose, onAddSatellites, userEmail, userId }: AddSatelliteModalProps) => {
  const [satellites, setSatellites] = useState<Satellite[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSatellites, setSelectedSatellites] = useState<Satellite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch satellites from API
  useEffect(() => {
    const fetchSatellites = async () => {
      try {
        setLoading(true)
        const cachedData = satelliteCache.get(userEmail)
        const now = Date.now()
        if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
          setSatellites(cachedData.data)
          setLoading(false)
          return
        }
        const response = await axios.get('http://localhost:8080/api/v1/satellites/getSatellites', {
          timeout: 3000,
        })
        if (response.status !== 200) {
          throw new Error('Failed to fetch satellites')
        }
        const data = response.data
        setSatellites(data)
        setError(null)
        satelliteCache.set(userEmail, { data, timestamp: now })
      } catch (err) {
        setError('Failed to load satellites. Please try again.')
        console.error('Error fetching satellites:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSatellites()
  }, [userEmail])

  // Memoize filtered satellites
  const filteredSatellites = useMemo(() => {
    return satellites.filter((satellite) =>
      satellite.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [satellites, searchQuery])

  const toggleSatellite = useCallback((satellite: Satellite) => {
    setSelectedSatellites((prev) => {
      const isSelected = prev.some((s) => s.id === satellite.id)
      if (isSelected) {
        return prev.filter((s) => s.id !== satellite.id)
      } else {
        return [...prev, satellite]
      }
    })
  }, [])

  const handleAddSatellites = useCallback(async () => {
    if (selectedSatellites.length === 0) {
      toast({
        title: "No satellites selected",
        description: "Please select at least one satellite to track.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post('http://localhost:8080/api/v1/users/addSatellite', {
        id: userId,
        email: userEmail,
        satellites: selectedSatellites
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status !== 200) {
        throw new Error('Failed to add satellites');
      }

      toast({
        title: "Success",
        description: "Satellites added successfully!",
      })
      
      onAddSatellites(selectedSatellites)
      onClose()
    } catch (err) {
      console.error('Error adding satellites:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add satellites. Please try again.",
        variant: "destructive",
      })
    }
  }, [selectedSatellites, onAddSatellites, onClose, userId, userEmail])

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
          <h2 className="text-xl font-bold">Add Satellites to Track</h2>
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

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search satellites..."
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
            <div className="text-center text-gray-400 py-8">No satellites found</div>
          ) : (
            <div 
              ref={parentRef}
              className="h-[400px] overflow-auto"
            >
              {filteredSatellites.map((satellite) => (
                <motion.button
                  key={satellite.id}
                  className={`w-full p-3 text-left transition-colors ${
                    selectedSatellites.some((s) => s.id === satellite.id)
                      ? "bg-[#1a2234] border-[#3b82f6]"
                      : "hover:bg-[#1a2234]"
                  } border border-[#1e2a41] rounded-lg mb-2`}
                  onClick={() => toggleSatellite(satellite)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{satellite.name}</h3>
                      <p className="text-sm text-gray-400">
                        NORAD ID: {satellite.norad_id} • {satellite.owner}
                      </p>
                    </div>
                    {selectedSatellites.some((s) => s.id === satellite.id) && (
                      <Check className="h-5 w-5 text-[#3b82f6]" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#1e2a41] hover:bg-[#1a2234]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSatellites}
              disabled={selectedSatellites.length === 0}
              className="bg-[#3b82f6] hover:bg-[#2563eb]"
            >
              Add Selected ({selectedSatellites.length})
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AddSatelliteModal 