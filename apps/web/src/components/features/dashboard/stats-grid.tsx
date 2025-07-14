"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/shared/utils/format";
import type { StatsData } from "@/components/features/dashboard/types";
import { useStats } from "@/lib/client/providers/dashboard-context";
import { withDataHandling } from "./shared/with-data-handling";

// The core stats component that only receives data
function StatsGridCore({ data }: { data: StatsData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Students"
        value={formatNumber(data.totalStudents)}
        change={data.enrollmentChange}
      />

      <StatCard
        title="Revenue"
        value={formatCurrency(data.totalRevenue)}
        change={data.revenueChange}
      />

      <StatCard
        title="Total Courses"
        value={formatNumber(data.totalCourses)}
      />

      <StatCard
        title="New Enrollments"
        value={formatNumber(data.enrollmentsThisMonth)}
      />
    </div>
  );
}

// Enhanced version with loading, error and empty states
const EnhancedStatsGrid = withDataHandling(
  StatsGridCore,
  {
    skeletonType: 'stats',
    errorTitle: 'Dashboard Statistics',
    emptyConfig: {
      getMessage: () => 'No stats available',
    }
  }
);

// Default stats to use as fallback
const defaultStats: StatsData = {
  totalStudents: 0,
  totalRevenue: 0,
  totalCourses: 0,
  enrollmentsThisMonth: 0,
  revenueChange: 0,
  enrollmentChange: 0
};

// Export the wrapper component that connects to the context
export function StatsGrid() {
  const { stats, isLoading, error, refreshDashboard } = useStats();
  
  return (
    <EnhancedStatsGrid 
      data={stats ?? defaultStats}
      isLoading={isLoading} 
      error={error} 
      refetch={refreshDashboard} 
    />
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
}

function StatCard({ title, value, change }: StatCardProps) {
  // Positive check for presence of change value
  const hasChange = typeof change === 'number';

  const changeColor = hasChange
    ? (change > 0 ? 'text-emerald-600' : 'text-red-500')
    : 'text-slate-500';

  const changeIcon = hasChange
    ? (change > 0 ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />)
    : undefined;

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col">
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xl font-medium text-slate-900">{value}</p>
        {hasChange && (
          <div className={`flex items-center text-xs ${changeColor}`}>
            {changeIcon}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}
