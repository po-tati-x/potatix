import { QueryClient } from "@tanstack/react-query";

/**
 * Creates and configures a new QueryClient instance.
 * Centralizing this function ensures consistent query behavior across the app.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // to avoid refetching immediately on the client after hydration.
        staleTime: 30 * 1000, // 30 seconds

        // Refetch on window focus is good for keeping data fresh.
        refetchOnWindowFocus: true,

        // Retry failed requests by default, but not excessively.
        retry: 1,
      },
    },
  });
}
