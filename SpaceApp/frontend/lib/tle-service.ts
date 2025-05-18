import { Satellite } from "@/types/satellite"

interface TLEEntry {
  name: string
  line1: string
  line2: string
  noradId: string
  timestamp: string
}

export class TLEService {
  private updateInterval: NodeJS.Timeout | null = null
  private userEmail: string | null = null
  private cache = new Map<string, { data: Satellite[], timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.startPeriodicUpdates()
  }

  setUserEmail(email: string) {
    console.log('Setting user email:', email);
    this.userEmail = email
  }

  private startPeriodicUpdates() {
    // Update TLE data every 6 hours
    this.updateInterval = setInterval(() => {
      this.updateAllTLEs()
    }, 6 * 60 * 60 * 1000)
  }

  async updateAllTLEs() {
    try {
      console.log('Updating all TLEs...');
      return await this.fetchTLEData()
    } catch (error) {
      console.error('Error updating TLE data:', error)
      return []
    }
  }

  async fetchTLEData(): Promise<TLEEntry[]> {
    if (!this.userEmail) {
      throw new Error('User email not set')
    }

    try {
      console.log('Fetching TLE data for user:', this.userEmail);
      
      // Check cache first
      const cachedData = this.cache.get(this.userEmail)
      const now = Date.now()
      if (cachedData && (now - cachedData.timestamp) < this.CACHE_DURATION) {
        return this.convertSatellitesToTLEEntries(cachedData.data)
      }

      // Get user's satellites from the API endpoint
      const userSatellitesResponse = await fetch(`http://localhost:8080/api/v1/users/stallitesTrackeByUser/${this.userEmail}`)
      if (!userSatellitesResponse.ok) {
        throw new Error(`HTTP error! status: ${userSatellitesResponse.status}`)
      }
      const userSatellites: Satellite[] = await userSatellitesResponse.json()
      console.log('Received user satellites:', userSatellites);

      // Get NORAD IDs
      const noradIds = userSatellites
        .filter(sat => sat.norad_id)
        .map(sat => sat.norad_id)
        .join(',')
      
      console.log('NORAD IDs to fetch:', noradIds);

      if (!noradIds) {
        console.log('No NORAD IDs found in user satellites');
        return []
      }

      // Fetch TLE data
      const response = await fetch(
        `https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradIds}&FORMAT=TLE`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const text = await response.text()
      console.log('Received TLE data from Celestrak:', text);
      
      const entries = this.parseTLEData(text, userSatellites)
      console.log('Parsed TLE entries:', entries);
      
      // Update cache
      this.cache.set(this.userEmail, {
        data: userSatellites.map(sat => {
          const entry = entries.find(e => e.noradId === sat.norad_id.toString())
          return {
            ...sat,
            tle: entry ? {
              line1: entry.line1,
              line2: entry.line2,
              timestamp: entry.timestamp
            } : undefined
          }
        }),
        timestamp: now
      })

      return entries
    } catch (error) {
      console.error('Error fetching TLE data:', error)
      return []
    }
  }

  private convertSatellitesToTLEEntries(satellites: Satellite[]): TLEEntry[] {
    return satellites
      .filter(sat => sat.tle)
      .map(sat => ({
        name: sat.name,
        line1: sat.tle!.line1,
        line2: sat.tle!.line2,
        noradId: sat.norad_id!.toString(),
        timestamp: sat.tle!.timestamp
      }))
  }

  private parseTLEData(text: string, userSatellites: Satellite[]): TLEEntry[] {
    console.log('Parsing TLE data for satellites:', userSatellites);
    const lines = text.trim().split('\n')
    const entries: TLEEntry[] = []
    const satelliteMap = new Map(userSatellites.map(sat => [sat.norad_id, sat]))

    for (let i = 0; i < lines.length; i += 2) {
      if (i + 1 >= lines.length) break
      
      const line1 = lines[i].trim()
      const line2 = lines[i + 1].trim()
      
      if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
        const noradId = line2.substring(2, 7)
        console.log('Found TLE for NORAD ID:', noradId);
        
        const satellite = satelliteMap.get(noradId)
        if (satellite) {
          entries.push({
            name: satellite.name,
            line1,
            line2,
            noradId,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
    
    console.log('Parsed TLE entries:', entries);
    return entries
  }

  public cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
}

// Create a singleton instance
export const tleService = new TLEService() 