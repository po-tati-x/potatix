'use client';

import Link from 'next/link';

/**
 * Empty state component for when there are no courses
 */
export function EmptyState() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="font-medium text-blue-800 mb-2">Getting Started</h3>
      <p className="text-sm text-blue-700 mb-3">
        Create your first course in minutes. Upload videos, set a price, and start selling.
      </p>
      <Link href="/courses/new">
        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create a Course
        </button>
      </Link>
    </div>
  );
} 