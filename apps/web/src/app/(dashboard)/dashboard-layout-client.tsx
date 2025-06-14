'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { DashboardContextProvider } from '@/lib/client/providers/dashboard-context';

// Client component that provides query client
export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  // Create a client-side query client instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContextProvider>
        {children}
      </DashboardContextProvider>
    </QueryClientProvider>
  );
} 