'use client';

import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error;
  onRetry?: () => void;
}

export function DashboardError({ error, onRetry }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
      
      <p className="text-slate-500 mb-6 text-center max-w-md">
        {error.message || 'An unexpected error occurred while loading the dashboard.'}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          Try again
        </Button>
      )}
    </div>
  );
} 