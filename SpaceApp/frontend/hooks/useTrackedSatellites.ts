import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';

const CACHE_KEY = 'tracked_satellites';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface Satellite {
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

interface CachedData {
  data: Satellite[];
  timestamp: number;
}

export function useTrackedSatellites(userEmail: string) {
  const queryClient = useQueryClient();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Check local storage cache on mount
  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { data, timestamp }: CachedData = JSON.parse(cachedData);
      const isValid = Date.now() - timestamp < CACHE_DURATION;
      
      if (isValid) {
        queryClient.setQueryData(['trackedSatellites', userEmail], data);
      }
    }
    setIsInitialLoad(false);
  }, [userEmail, queryClient]);

  const { data: satellites, isLoading, error } = useQuery<Satellite[]>({
    queryKey: ['trackedSatellites', userEmail],
    queryFn: async () => {
      try {
        const response = await axios.get<Satellite[]>(
          `http://localhost:8080/api/v1/users/stallitesTrackeByUser/${userEmail}`
        );
        
        // Update local storage cache
        const cacheData: CachedData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        return response.data;
      } catch (error) {
        console.error('Error fetching tracked satellites:', error);
        throw error;
      }
    },
    // Only fetch if there's no cached data and it's not the initial load
    enabled: !isInitialLoad,
    // Keep cached data for 5 minutes
    staleTime: CACHE_DURATION,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Don't refetch on mount
    refetchOnMount: false
  });

  // Function to invalidate cache and force refresh
  const refreshSatellites = () => {
    localStorage.removeItem(CACHE_KEY);
    queryClient.invalidateQueries({ queryKey: ['trackedSatellites', userEmail] });
  };

  return {
    satellites,
    isLoading,
    error,
    refreshSatellites
  };
} 