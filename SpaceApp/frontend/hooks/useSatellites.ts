import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export interface Satellite {
  id: string;
  name: string;
  norad_id: number;
  owner: string;
  launchDate: string;
  launchSite: string;
  popular: string;
  altitude: string;
  orbitType: string;
  status: string;
  type: string;
}

// Cache object to store satellites data
let satellitesCache: {
  data: Satellite[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSatellites() {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSatellites = async () => {
      try {
        // Check if we have valid cached data
        const now = Date.now();
        if (
          satellitesCache.data &&
          now - satellitesCache.timestamp < CACHE_DURATION
        ) {
          setSatellites(satellitesCache.data);
          setIsLoading(false);
          return;
        }

        // Fetch new data if cache is invalid
        const response = await axios.get('http://localhost:3000/api/satellites');
        const data = response.data;

        // Update cache
        satellitesCache = {
          data,
          timestamp: now,
        };

        setSatellites(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch satellites:', err);
        setError('Failed to load satellites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSatellites();
  }, []);

  // Memoize filtered satellites by owner
  const satellitesByOwner = useMemo(() => {
    const ownerMap = new Map<string, Satellite[]>();
    satellites.forEach((satellite) => {
      const owner = satellite.owner;
      if (!ownerMap.has(owner)) {
        ownerMap.set(owner, []);
      }
      ownerMap.get(owner)?.push(satellite);
    });
    return ownerMap;
  }, [satellites]);

  // Memoize unique owners list
  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(satellites.map((s) => s.owner))).sort();
  }, [satellites]);

  // Memoize popular satellites
  const popularSatellites = useMemo(() => {
    return satellites.filter((s) => s.popular === 'yes');
  }, [satellites]);

  return {
    satellites,
    isLoading,
    error,
    satellitesByOwner,
    uniqueOwners,
    popularSatellites,
  };
} 