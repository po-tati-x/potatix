import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { signOut } from "@/lib/auth/auth";
import { dashboardKeys } from "@/lib/shared/constants/query-keys";
import { useCallback } from "react";
import { dashboardApi } from "../api/dashboard";
import type { DashboardData } from "../api/dashboard";

interface DashboardQueryOptions {
  initialData?: DashboardData;
  enabled?: boolean;
}

/**
 * Fetch the entire dashboard payload
 */
export function useDashboardData(options?: DashboardQueryOptions): UseQueryResult<DashboardData, Error> {
  return useQuery<DashboardData, Error>({
    queryKey: dashboardKeys.all(),
    queryFn: () => dashboardApi.getAllDashboardData(),
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 min cache window
  });
}

/**
 * Trigger a full dashboard refetch
 */
export function useRefreshDashboard(): () => void {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: dashboardKeys.all() });
  }, [queryClient]);
}

/**
 * Sign-out helper with cache clear
 */
export function useSignOut(): UseMutationResult<void, Error, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await signOut();
      globalThis.location.href = "/login";
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
