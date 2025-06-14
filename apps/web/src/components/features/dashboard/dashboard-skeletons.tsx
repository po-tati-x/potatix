import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard header skeleton for loading state
 */
export function DashboardHeaderSkeleton() {
  return (
    <div className="mb-6 border-b border-slate-200 pb-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-32 mb-2" />
          <Skeleton className="h-5 w-44" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}

/**
 * Stats grid skeleton for loading state
 */
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-md p-4"
        >
          <Skeleton className="h-3 w-1/3 mb-2" />
          <Skeleton className="h-5 w-1/2 mt-2" />
          <Skeleton className="h-3 w-1/4 mt-3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Courses panel skeleton for loading state
 */
export function CoursesPanelSkeleton() {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-16 h-10 flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Course progress tracking skeleton for loading state
 */
export function CourseProgressSkeleton() {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="p-4 space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-slate-100 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Profile card skeleton for loading state
 */
export function ProfileCardSkeleton() {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-100">
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Revenue insights skeleton for loading state
 */
export function RevenueInsightsSkeleton() {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <Skeleton className="h-5 w-36" />
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

/**
 * Courses grid skeleton for loading state - used in the courses page
 */
export function CoursesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="border border-slate-200 rounded-lg overflow-hidden bg-white"
        >
          <div className="h-44 bg-slate-50">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="p-5">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Combined full dashboard skeleton for initial load
 */
export function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <DashboardHeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StatsGridSkeleton />
          <CoursesPanelSkeleton />
          <CourseProgressSkeleton />
        </div>
        <div className="space-y-6">
          <ProfileCardSkeleton />
          <RevenueInsightsSkeleton />
        </div>
      </div>
    </div>
  );
} 