'use client';

import { DollarSign, TrendingUp, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/shared/utils/format';
import { useRevenueInsightsData } from "@/lib/client/hooks/use-dashboard-adapter";
import { Skeleton } from '@/components/ui/skeleton';
import type { TopPerformingCourse } from './types';

export function RevenueInsightsPanel() {
  const { revenueData, courses, isLoading, error } = useRevenueInsightsData();

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-8 w-40 mb-1" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-md bg-slate-50">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-medium text-slate-900">Revenue Insights</h2>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-sm font-medium text-slate-900 mb-1">Failed to load revenue data</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs">
            There was a problem loading your revenue insights.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!courses?.length || !revenueData) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-medium text-slate-900">Revenue Insights</h2>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center text-center">
          <DollarSign className="h-8 w-8 text-slate-400 mb-2" />
          <h3 className="text-sm font-medium text-slate-900 mb-1">No revenue data yet</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Publish and sell your first course to start tracking revenue.
          </p>
        </div>
      </div>
    );
  }
  
  // Normal state with data
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-medium text-slate-900">Revenue Insights</h2>
        </div>
      </div>
      
      <div className="p-4">
        {/* Total Revenue with Month-over-Month change */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-slate-900">{formatCurrency(revenueData.totalRevenue)}</h3>
            <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              revenueData.momRevenueChange >= 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {revenueData.momRevenueChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(revenueData.momRevenueChange)}% from last month</span>
            </div>
          </div>
        </div>
        
        {/* Key metrics grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-md bg-slate-50">
            <p className="text-xs text-slate-500 mb-1">Avg. Revenue / Student</p>
            <p className="text-base font-medium text-slate-900">{formatCurrency(revenueData.avgRevenuePerStudent)}</p>
          </div>
          <div className="p-3 rounded-md bg-slate-50">
            <p className="text-xs text-slate-500 mb-1">Avg. Course Value</p>
            <p className="text-base font-medium text-slate-900">{formatCurrency(revenueData.avgCourseValue)}</p>
          </div>
          <div className="p-3 rounded-md bg-slate-50">
            <p className="text-xs text-slate-500 mb-1">MRR</p>
            <p className="text-base font-medium text-slate-900">{formatCurrency(revenueData.monthlyRecurringRevenue)}</p>
          </div>
        </div>
        
        {/* Top performing courses */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
            <p className="text-xs font-medium text-slate-900">Top Performing Courses</p>
          </div>
          
          <div className="space-y-2">
            {revenueData.topPerformingCourses.map((course: TopPerformingCourse) => (
              <div key={course.id} className="flex items-center justify-between text-sm p-2 border border-slate-100 rounded-md">
                <p className="text-xs font-medium text-slate-900 truncate flex-1">{course.title}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-600">{formatCurrency(course.revenue)}</span>
                  </div>
                  <div className={`text-xs ${
                    course.growth >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {course.growth >= 0 ? '+' : ''}{course.growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}