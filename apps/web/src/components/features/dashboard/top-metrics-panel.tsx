import { formatCurrency, formatNumber } from '@/lib/shared/utils/format';
import { withDataHandling } from './shared/with-data-handling';
import { useHeroMetrics, useStats } from '@/lib/client/providers/dashboard-context';
import type { HeroMetrics, StatsData } from '@/components/features/dashboard/types';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface CardProps {
  title: string;
  value: string;
  sub?: string;
  trend?: number[];
  positive?: boolean;
}

function Card({ title, value, sub, trend, positive }: CardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col text-center">
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <div className="flex items-center justify-center mb-1">
        <p className="text-xl font-medium text-slate-900 mr-1">{value}</p>
        {positive !== undefined && (
          positive ? (
            <ArrowUp className="h-4 w-4 text-emerald-600" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500" />
          )
        )}
      </div>
      {sub && <span className="text-[10px] text-slate-400 mt-0.5">{sub}</span>}
      {trend && trend.length > 0 && (
        <div className="mt-2">
          <Sparklines data={trend} width={100} height={24} margin={4}>
            <SparklinesLine color="#0F766E" style={{ strokeWidth: 1 }} />
          </Sparklines>
        </div>
      )}
    </div>
  );
}

function Core({ hero, stats }: { hero: HeroMetrics; stats: StatsData }) {
  return (
    <div className="space-y-4">
      {/* Row 1 – Hero metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          title="Revenue (All-time)"
          value={formatCurrency(hero.revenueAll)}
          sub={`Today ${formatCurrency(hero.revenueToday)} / MTD ${formatCurrency(hero.revenueMTD)}`}
          trend={hero.revenueTrend ?? []}
          positive={stats.revenueChange >= 0}
        />
        <Card
          title="Enrollments (All-time)"
          value={formatNumber(hero.enrollmentsAll)}
          sub={`Today ${formatNumber(hero.enrollmentsToday)} / MTD ${formatNumber(hero.enrollmentsMTD)}`}
          trend={hero.enrollmentTrend ?? []}
          positive={stats.enrollmentChange >= 0}
        />
        <Card title="Active Students" value={formatNumber(hero.activeStudents)} />
        <Card
          title="Avg Rating"
          value={hero.avgRating ? hero.avgRating.toFixed(1) : '—'}
        />
      </div>

      {/* Row 2 – Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Students" value={formatNumber(stats.totalStudents)} />
        <Card title="Total Courses" value={formatNumber(stats.totalCourses)} />
        <Card title="New Enrollments" value={formatNumber(stats.enrollmentsThisMonth)} />
        <Card title="Revenue MTD" value={formatCurrency(stats.totalRevenue)} />
      </div>
    </div>
  );
}

const Panel = withDataHandling(Core, { skeletonType: 'stats', errorTitle: 'Metrics' });

export function TopMetricsPanel() {
  const { heroMetrics, isLoading: heroLoading, error: heroError } = useHeroMetrics();
  const { stats, isLoading: statsLoading, error: statsError } = useStats();

  const defaultHero: HeroMetrics = {
    revenueToday: 0,
    revenueMTD: 0,
    revenueAll: 0,
    enrollmentsToday: 0,
    enrollmentsMTD: 0,
    enrollmentsAll: 0,
    activeStudents: 0,
    avgRating: undefined,
    revenueTrend: [],
    enrollmentTrend: [],
  };

  const defaultStats: StatsData = {
    totalStudents: 0,
    totalRevenue: 0,
    totalCourses: 0,
    enrollmentsThisMonth: 0,
    revenueChange: 0,
    enrollmentChange: 0,
  };

  return (
    <Panel
      hero={heroMetrics ?? defaultHero}
      stats={stats ?? defaultStats}
      isLoading={heroLoading || statsLoading}
      error={heroError || statsError}
    />
  );
} 