import { Satellite } from "@/types/satellite"

interface TLEEntry {
  name: string
  line1: string
  line2: string
  noradId: string
}

interface CachedTLE {
  data: TLEEntry[]
  timestamp: number
}

export class TLEService {
  private readonly CACHE_KEY = 'satellite_tle_cache'
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  async fetchTLEData(satellites: Satellite[]): Promise<TLEEntry[]> {
    const cachedData = this.loadCachedData()
    if (cachedData) {
      this.cleanOldTLEs(cachedData)
      return cachedData.data
    }

    const noradIds = satellites
      .filter(sat => sat.norad_id)
      .map(sat => sat.norad_id as string)
      .join(',')

    if (!noradIds) return []

    try {
      const response = await fetch(
        `https://celestrak.com/NORAD/elements/gp.php?CATNR=${noradIds}&FORMAT=TLE`
      )
      const text = await response.text()
      const tleData = this.parseTLEData(text)
      
      this.saveCachedData(tleData)
      return tleData
    } catch (error) {
      console.error('Error fetching TLE data:', error)
      return []
    }
  }

  private parseTLEData(text: string): TLEEntry[] {
    const lines = text.trim().split('\n')
    const entries: TLEEntry[] = []

    for (let i = 0; i < lines.length; i += 2) {
      if (i + 1 >= lines.length) break

      const line1 = lines[i].trim()
      const line2 = lines[i + 1].trim()

      if (this.isValidTLE(line1, line2)) {
        const noradId = line2.substring(2, 7)
        entries.push({
          name: `Satellite ${noradId}`,
          line1,
          line2,
          noradId
        })
      }
    }

    return entries
  }

  private isValidTLE(line1: string, line2: string): boolean {
    return line1.startsWith('1 ') && line2.startsWith('2 ')
  }

  private loadCachedData(): CachedTLE | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return null

      const data = JSON.parse(cached) as CachedTLE
      if (Date.now() - data.timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY)
        return null
      }

      return data
    } catch {
      return null
    }
  }

  private saveCachedData(data: TLEEntry[]): void {
    const cache: CachedTLE = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
  }

  private cleanOldTLEs(cachedData: CachedTLE): void {
    const now = Date.now()
    if (now - cachedData.timestamp > this.CACHE_DURATION) {
      localStorage.removeItem(this.CACHE_KEY)
    }
  }
} 