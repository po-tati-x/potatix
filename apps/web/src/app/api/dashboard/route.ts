import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-server";
import { dashboardService } from "@/lib/server/services/dashboard";

/**
 * Consolidated API endpoint for fetching ALL dashboard data in a single request
 * Uses the dashboard service for all business logic
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all dashboard data using the service
    const dashboardData = await dashboardService.getAllDashboardData(userId);

    // Return all dashboard data in a single response
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch dashboard data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 