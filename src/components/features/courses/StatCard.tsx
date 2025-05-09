'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}

interface ColorConfig {
  bg: string;
  text: string;
  bar1: string;
  bar2: string;
  bar3: string;
}

/**
 * Card component for displaying a statistic
 */
export function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorMap: Record<StatCardProps['color'], ColorConfig> = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      bar1: 'bg-blue-200',
      bar2: 'bg-blue-300',
      bar3: 'bg-blue-500',
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      bar1: 'bg-emerald-200',
      bar2: 'bg-emerald-300',
      bar3: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      bar1: 'bg-amber-200',
      bar2: 'bg-amber-300',
      bar3: 'bg-amber-500',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      bar1: 'bg-purple-200',
      bar2: 'bg-purple-300',
      bar3: 'bg-purple-500',
    },
  };

  const colors = colorMap[color];

  return (
    <div className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:shadow-sm">
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
          <div className={`rounded-full ${colors.bg} p-1.5`}>
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-semibold text-neutral-900">{value}</p>
          <div className="flex h-10 items-end">
            <div className={`h-5 w-2 rounded-sm ${colors.bar1} mx-[2px] group-hover:h-7 transition-all duration-300`}></div>
            <div className={`h-6 w-2 rounded-sm ${colors.bar2} mx-[2px] group-hover:h-8 transition-all duration-300`}></div>
            <div className={`h-10 w-2 rounded-sm ${colors.bar3} mx-[2px] group-hover:h-10 transition-all duration-300`}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 