'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './query-client';

interface DashboardProviderProps {
  children: ReactNode;
  dehydratedState?: unknown;
}

/**
 * Provider component for the dashboard that sets up React Query
 * with hydration support from server-side prefetched data
 */
export function DashboardProvider({ 
  children, 
  dehydratedState,
}: DashboardProviderProps) {
  // Create a client
  const queryClient = createQueryClient();
  
  // If we have dehydrated state, hydrate it
  if (dehydratedState) {
    // Hydration happens automatically in React Query v5
    queryClient.setQueryData(['__dehydrated'], dehydratedState);
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 