/**
 * Client-side API functions for dashboard-related operations
 */
import axios from "axios";

/**
 * Minimal dashboard DTO. Replace the inner `any` when strict types are consolidated.
 */
export interface DashboardData {
  stats: unknown;
  courses: unknown;
  progressData: unknown;
  revenueData: unknown;
  profile: unknown;
  heroMetrics?: unknown;
}

/**
 * Simple wrapped error for API calls. Components may inspect `status`.
 */
export class ApiError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Dashboard API functions
 */
export const dashboardApi = {
  /**
   * Fetch all dashboard data in one shot.
   */
  async getAllDashboardData(): Promise<DashboardData> {
    const { data } = await axios.get<DashboardData>("/api/dashboard");
    return data;
  },
};
