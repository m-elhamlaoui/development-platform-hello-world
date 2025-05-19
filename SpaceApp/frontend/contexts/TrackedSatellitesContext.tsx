import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/lib/auth-context';

interface Satellite {
  id: string;
  name: string;
  noradId: string;
}

interface CachedData {
  data: Satellite[];
  timestamp: number;
}

interface TrackedSatellitesContextType {
  satellites: Satellite[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refreshSatellites: () => void;
}

const CACHE_KEY = 'tracked_satellites';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const TrackedSatellitesContext = createContext<TrackedSatellitesContextType | undefined>(undefined);

export function TrackedSatellitesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: satellites, isLoading, error } = useQuery<Satellite[]>({
    queryKey: ['trackedSatellites', user?.email],
    queryFn: async () => {
      if (!user?.email) {
        throw new Error('User not authenticated');
      }

      // Try to get data from localStorage first
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp }: CachedData = JSON.parse(cachedData);
        const isValid = Date.now() - timestamp < CACHE_DURATION;
        
        if (isValid) {
          return data;
        }
      }

      // If no valid cache, fetch from API
      const response = await axios.get<Satellite[]>(
        `http://localhost:8080/api/v1/users/stallitesTrackeByUser/${user.email}`
      );
      
      // Update cache
      const cacheData: CachedData = {
        data: response.data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      return response.data;
    },
    enabled: !!user?.email,
    staleTime: CACHE_DURATION,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const refreshSatellites = () => {
    localStorage.removeItem(CACHE_KEY);
    queryClient.invalidateQueries({ queryKey: ['trackedSatellites', user?.email] });
  };

  return (
    <TrackedSatellitesContext.Provider
      value={{
        satellites,
        isLoading,
        error: error as Error | null,
        refreshSatellites
      }}
    >
      {children}
    </TrackedSatellitesContext.Provider>
  );
}

export function useTrackedSatellites() {
  const context = useContext(TrackedSatellitesContext);
  if (context === undefined) {
    throw new Error('useTrackedSatellites must be used within a TrackedSatellitesProvider');
  }
  return context;
} 