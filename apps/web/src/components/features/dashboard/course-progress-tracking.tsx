'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard';
import { BarChart2, TrendingDown, AlertCircle, CheckSquare, BookOpen } from 'lucide-react';
import { formatNumber } from '@/lib/utils/format';

export function CourseProgressTracking() {
  const { 
    courses, 
    isCoursesLoading,
    progressData,
    isProgressLoading,
    progressError,
    fetchProgressData
  } = useDashboardStore();

  // Fetch progress data when courses are loaded
  useEffect(() => {
    if (courses?.length && !progressData.length && !isProgressLoading) {
      fetchProgressData();
    }
  }, [courses, progressData.length, isProgressLoading, fetchProgressData]);

  // Loading state
  if (isCoursesLoading || isProgressLoading) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-medium text-slate-900">Course Progress</h2>
          </div>
        </div>
        <div className="p-4 flex flex-col items-center justify-center h-[300px]">
          <div className="h-6 w-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading progress metrics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (progressError) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-medium text-slate-900">Course Progress</h2>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-sm font-medium text-slate-900 mb-1">Failed to load progress data</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs">
            There was a problem loading your course progress metrics.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!courses?.length || !progressData.length) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-medium text-slate-900">Course Progress</h2>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center text-center">
          <BookOpen className="h-8 w-8 text-slate-400 mb-2" />
          <h3 className="text-sm font-medium text-slate-900 mb-1">No course progress data yet</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Start creating and publishing courses to track your students&apos; progress.
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
          <BarChart2 className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-medium text-slate-900">Course Progress</h2>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {progressData.map(course => (
          <div key={course.id} className="border border-slate-100 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{course.title}</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{formatNumber(course.activeStudents)} students</span>
                </div>
              </div>
            </div>
            
            {/* Completion rate bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Completion Rate</span>
                <span className="text-xs font-medium text-slate-900">{course.completionRate}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${course.completionRate}%` }}
                ></div>
              </div>
            </div>
            
            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded-md bg-slate-50">
                <div className="flex items-center gap-1 mb-1">
                  <CheckSquare className="h-3 w-3 text-emerald-500" />
                  <p className="text-xs text-slate-500">Avg. Engagement</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{course.avgEngagement}%</p>
              </div>
              <div className="p-2 rounded-md bg-slate-50">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-amber-500" />
                  <p className="text-xs text-slate-500">Dropout Rate</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{course.dropoffRate}%</p>
              </div>
            </div>
            
            {/* Bottleneck lesson */}
            {course.bottleneckLesson !== 'N/A' && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Bottleneck Lesson</p>
                <p className="text-xs font-medium text-red-600">{course.bottleneckLesson}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}