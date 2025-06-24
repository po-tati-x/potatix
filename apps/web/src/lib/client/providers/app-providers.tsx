'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/client/providers/query-client';

interface AppProvidersProps {
  children: ReactNode;
  dehydratedState?: unknown;
}

export function AppProviders({ children, dehydratedState }: AppProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
} 