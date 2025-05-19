'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth-context'
import { TrackedSatellitesProvider } from '@/contexts/TrackedSatellitesContext'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TrackedSatellitesProvider>
          {children}
        </TrackedSatellitesProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
} 