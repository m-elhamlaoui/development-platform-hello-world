'use client';

import { AuthProvider } from '../lib/auth-context';
import { Providers } from './providers';
import { PerformanceMonitor } from '@/components/performance-monitor';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      {children}
      <PerformanceMonitor showDetails />
    </Providers>
  );
} 