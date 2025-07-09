'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/shared/utils/cn';

interface SidebarChromeProps {
  children: ReactNode;
}

export function SidebarChrome({ children }: SidebarChromeProps) {
  return (
    <div
      className={cn(
        'relative sticky top-0 self-start h-screen w-60 sm:w-64 lg:w-72 max-w-full bg-neutral-100',
      )}
      style={{ zIndex: 30 }}
    >
      {/* Fixed gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            'absolute -left-2/3 bottom-0 aspect-square w-[140%] translate-y-1/4 rounded-full opacity-15 blur-[75px]',
            'bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]',
          )}
        />
      </div>

      {/* Pane content – scrolling handled inside each pane */}
      <div className="relative z-10 flex h-full flex-col">
        {children}
      </div>
    </div>
  );
} 