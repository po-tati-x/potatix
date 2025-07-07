'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/shared/utils/cn';

interface SidebarChromeProps {
  isOpen: boolean;
  children: ReactNode;
}

export function SidebarChrome({ isOpen, children }: SidebarChromeProps) {
  return (
    <div
      className={cn(
        'relative h-full w-60 sm:w-64 lg:w-72 max-w-full bg-neutral-100 transition-transform md:translate-x-0',
        !isOpen && '-translate-x-full',
      )}
      style={{ zIndex: 30 }}
    >
      {/* Subtle conic gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            'pointer-events-none absolute -left-2/3 bottom-0 aspect-square w-[140%] translate-y-1/4 rounded-full opacity-15 blur-[75px]',
            'bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]',
          )}
        />
      </div>
      {children}
    </div>
  );
} 