import { formatCurrency, formatNumber } from '@/lib/shared/utils/format';
import type { HeroMetrics } from '@/components/features/dashboard/types';
import { withDataHandling } from './shared/with-data-handling';
import { useHeroMetrics } from '@/lib/client/providers/dashboard-context';

interface MetricCardProps {
  title: string;
  today: number;
  mtd: number;
  all: number;
  formatter: (val: number) => string;
}

function MetricCard({ title, today, mtd, all, formatter }: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col text-center">
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <div className="flex justify-center space-x-4 text-sm font-medium text-slate-800">
        <div>
          <p>{formatter(today)}</p>
          <span className="text-[10px] text-slate-400">Today</span>
        </div>
        <div>
          <p>{formatter(mtd)}</p>
          <span className="text-[10px] text-slate-400">MTD</span>
        </div>
        <div>
          <p>{formatter(all)}</p>
          <span className="text-[10px] text-slate-400">All</span>
        </div>
      </div>
    </div>
  );
}

function HeroMetricsCore({ data }: { data: HeroMetrics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Revenue"
        today={data.revenueToday}
        mtd={data.revenueMTD}
        all={data.revenueAll}
        formatter={formatCurrency}
      />
      <MetricCard
        title="Enrollments"
        today={data.enrollmentsToday}
        mtd={data.enrollmentsMTD}
        all={data.enrollmentsAll}
        formatter={formatNumber}
      />
      <MetricCard
        title="Active Students"
        today={data.activeStudents}
        mtd={data.activeStudents}
        all={data.activeStudents}
        formatter={formatNumber}
      />
      <MetricCard
        title="Avg Rating"
        today={data.avgRating ?? 0}
        mtd={data.avgRating ?? 0}
        all={data.avgRating ?? 0}
        formatter={(v) => v.toFixed(1)}
      />
    </div>
  );
}

const EnhancedHeroMetrics = withDataHandling(HeroMetricsCore, {
  skeletonType: 'stats',
  errorTitle: 'Hero Metrics',
  emptyConfig: { getMessage: () => 'No data' },
});

export function HeroMetricsRow() {
  const { heroMetrics, isLoading, error, refreshDashboard } = useHeroMetrics();

  const defaultMetrics: HeroMetrics = {
    revenueToday: 0,
    revenueMTD: 0,
    revenueAll: 0,
    enrollmentsToday: 0,
    enrollmentsMTD: 0,
    enrollmentsAll: 0,
    activeStudents: 0,
    avgRating: null,
  };

  return (
    <EnhancedHeroMetrics
      data={heroMetrics ?? defaultMetrics}
      isLoading={isLoading}
      error={error}
      refetch={refreshDashboard}
    />
  );
} 