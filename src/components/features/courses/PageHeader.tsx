'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
}

/**
 * Header component for page titles with description and action button
 */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <div className="flex justify-end">
        <Link href="/courses/new">
          <button className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </button>
        </Link>
      </div>
    </div>
  );
} 