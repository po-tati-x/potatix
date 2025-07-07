'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { DEFAULT_NAV, type NavSection } from './config/static-nav';

export type SidebarArea = 'default' | 'course';

// Determine which sidebar pane should be visible based on route
export function useNavigationArea(): SidebarArea {
  const pathname = usePathname();

  return useMemo<SidebarArea>(() => {
    // Any edit route under /courses/{id}/edit triggers course pane
    if (pathname.startsWith('/courses') && pathname.includes('/edit')) {
      return 'course';
    }
    return 'default';
  }, [pathname]);
}

export function useStaticNav(): NavSection[] {
  return DEFAULT_NAV;
} 