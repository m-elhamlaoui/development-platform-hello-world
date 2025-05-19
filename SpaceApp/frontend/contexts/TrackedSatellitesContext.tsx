import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Satellite {
  id: string;
  name: string;
  noradId: string;
}

interface TrackedSatellitesContextType {
  satellites: Satellite[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refreshSatellites: () => void;
}

const TrackedSatellitesContext = createContext<TrackedSatellitesContextType | undefined>(undefined);

export function TrackedSatellitesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: satellites, isLoading, error } = useQuery<Satellite[]>({
    queryKey: ['trackedSatellites'],
    queryFn: async () => {
      // Get the current user's email from localStorage or your auth context
      const userEmail = localStorage.getItem('userEmail') || '';
      if (!userEmail) {
        throw new Error('User email not found');
      }

      const response = await axios.get<Satellite[]>(
        `http://localhost:8080/api/v1/users/stallitesTrackeByUser/${userEmail}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const refreshSatellites = () => {
    queryClient.invalidateQueries({ queryKey: ['trackedSatellites'] });
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