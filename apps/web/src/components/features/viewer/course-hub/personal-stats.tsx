'use client';

import { Flame, Clock, Trophy, TrendingUp } from 'lucide-react';
import type { LearningStats } from './types';
import type { ReactElement } from 'react';

interface PersonalStatsProps {
  stats: LearningStats;
}

const accentMap = {
  orange: 'text-orange-600 bg-orange-50 border-orange-200',
  blue: 'text-blue-600 bg-blue-50 border-blue-200',
  purple: 'text-purple-600 bg-purple-50 border-purple-200',
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
} as const;

interface Stat {
  icon: ReactElement;
  label: string;
  value: string | number;
  sub?: string;
  accent: keyof typeof accentMap;
  hidden?: boolean;
}

function StatCard({ icon, label, value, sub, accent }: Stat) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-center transition hover:border-slate-300">
      <span className={`rounded-full p-2 ${accentMap[accent]}`}>{icon}</span>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-600">{sub}</p>}
    </div>
  );
}

export function PersonalStats({ stats }: PersonalStatsProps) {
  function fmtHours(h: number) {
    return h < 1 ? `${Math.round(h * 60)}m` : `${h.toFixed(1)}h`;
  }

  const tiles: Stat[] = [
    {
      icon: <Flame className="h-5 w-5" />,
      label: 'Current Streak',
      value: stats.currentStreak,
      sub: stats.currentStreak === 0 ? 'Start today!' : `${stats.currentStreak} days strong`,
      accent: 'orange',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'This Week',
      value: fmtHours(stats.totalHoursThisWeek),
      sub: `Avg ${stats.averageSessionLength}m/session`,
      accent: 'blue',
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: 'Best Quiz',
      value: `${stats.bestQuizScore ?? 0}%`,
      sub: stats.fastestQuizTime ? `In ${Math.round(stats.fastestQuizTime / 60)}m` : undefined,
      accent: 'purple',
      hidden: stats.bestQuizScore === undefined,
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: 'Total Time',
      value: fmtHours(stats.totalHoursAllTime),
      sub: `Longest: ${stats.longestStreak} days`,
      accent: 'emerald',
    },
  ];

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Your Progress</h3>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(9rem,1fr))]">
        {tiles.filter(t => !t.hidden).map(t => (
          <StatCard key={t.label} {...t} />
        ))}
      </div>
    </section>
  );
}
