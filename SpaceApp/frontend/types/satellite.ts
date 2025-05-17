export interface Satellite {
  id: number
  name: string
  type: string
  status: string
  altitude: string
  orbitType: string
  norad_id?: string
  launchDate?: string
  launchSite?: string
  popular?: boolean
  owner?: string
  tle?: {
    line1: string
    line2: string
    timestamp: string
  }
  position?: {
    latitude: number
    longitude: number
    altitude: number
    velocity: number
  }
} 