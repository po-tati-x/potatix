"use client";

import React from "react";
import { DashboardError } from "./error-components";
import {
  DashboardSkeleton,
  StatsGridSkeleton,
  CoursesPanelSkeleton,
  CourseProgressSkeleton,
  RevenueInsightsSkeleton,
} from "../dashboard-skeletons";

/*
 * Generic higher-order component to inject loading, error and empty states.
 * Keeps UI logic DRY across dashboard widgets.
 */
export interface WithDataHandlingConfig {
  /** What skeleton to show while loading */
  skeletonType?: "dashboard" | "stats" | "courses" | "progress" | "revenue";
  /** Optional title shown in error component (currently unused) */
  errorTitle?: string;
  /** Empty-state configuration (not fully implemented, but kept for future) */
  emptyConfig?: {
    getMessage: (props: unknown) => string;
  };
}

export function withDataHandling<WrappedProps extends object = Record<string, unknown>>(
  WrappedComponent: React.ComponentType<WrappedProps>,
  config: WithDataHandlingConfig = {}
) {
  return function WithDataHandling(
    props: WrappedProps & {
      isLoading?: boolean;
      error?: Error | null;
      refetch?: () => void;
    },
  ) {
    const { isLoading, error, refetch, ...rest } = props;

    if (isLoading) {
      switch (config.skeletonType) {
        case "stats":
          return <StatsGridSkeleton />;
        case "courses":
          return <CoursesPanelSkeleton />;
        case "progress":
          return <CourseProgressSkeleton />;
        case "revenue":
          return <RevenueInsightsSkeleton />;
        default:
          return <DashboardSkeleton />;
      }
    }

    if (error) {
      return <DashboardError error={error} onRetry={refetch} />;
    }

    // TODO: Empty state handling if needed

    return <WrappedComponent {...(rest as WrappedProps)} />;
  };
} 