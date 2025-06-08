'use client';

import { ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';
import { useDashboardStore } from '@/lib/stores/dashboard';
import { useEffect } from 'react';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export function StatsGrid() {
  // Get stats data and state from centralized store
  const { 
    stats, 
    isStatsLoading, 
    statsError, 
    fetchStats 
  } = useDashboardStore();
  
  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Loading state
  if (isStatsLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-md p-4">
            <div className="h-3 w-1/3 bg-slate-200 rounded mb-2 animate-pulse"></div>
            <div className="h-5 w-1/2 bg-slate-200 rounded mt-2 animate-pulse"></div>
            <div className="h-3 w-1/4 bg-slate-200 rounded mt-3 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }
  
  // Error state
  if (statsError) {
    return (
      <div className="border border-red-200 rounded-md p-4 bg-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <RefreshCcw className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Failed to load stats</h3>
              <p className="text-xs text-red-600 mt-1">There was an error loading your dashboard statistics.</p>
            </div>
          </div>
          <Button
            type="danger"
            size="small"
            onClick={fetchStats}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Handle missing data
  if (!stats) {
    return null;
  }
  
  // Normal state with data
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        title="Total Students" 
        value={formatNumber(stats.totalStudents)} 
        change={stats.enrollmentChange} 
      />
      
      <StatCard 
        title="Revenue" 
        value={formatCurrency(stats.totalRevenue)} 
        change={stats.revenueChange} 
      />
      
      <StatCard 
        title="Total Courses" 
        value={formatNumber(stats.totalCourses)}
      />
      
      <StatCard 
        title="New Enrollments" 
        value={formatNumber(stats.enrollmentsThisMonth)}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
}

function StatCard({ title, value, change }: StatCardProps) {
  // Determine change color and arrow
  const changeColor = !change 
    ? 'text-slate-500' 
    : change > 0 
      ? 'text-emerald-600' 
      : 'text-red-500';
      
  const changeIcon = !change 
    ? null 
    : change > 0 
      ? <ArrowUp className="h-3 w-3 mr-0.5" /> 
      : <ArrowDown className="h-3 w-3 mr-0.5" />;

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col">
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xl font-medium text-slate-900">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${changeColor}`}>
            {changeIcon}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}