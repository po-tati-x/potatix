'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/shared/utils/cn';
import { useIsMobile } from '@/lib/client/hooks/use-is-mobile';
import { useScrollLock } from '@/lib/client/hooks/use-scroll-lock';
import { SideNavContext } from './context';
import { useNavigationArea } from './hooks';
import type { SidebarArea } from './hooks';
import { DefaultPane } from './panes/default-pane';
import { CoursePane } from './panes/course-pane';
import { SidebarChrome } from './chrome/sidebar-chrome';

interface AppSidebarLayoutProps {
  children: ReactNode;
}

export function SidebarRoot({ children }: AppSidebarLayoutProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  // Allow panes to override automatic detection (e.g., back button)
  const [overrideArea, setOverrideArea] = useState<SidebarArea | null>(null);

  // Lock scroll when mobile side nav open
  useScrollLock(isOpen && isMobile);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const area = useNavigationArea();
  const resolvedArea = overrideArea ?? area;
  // Reset overrides when the route-derived area changes
  const [lastArea, setLastArea] = useState<SidebarArea>(area);

  useEffect(() => {
    if (area !== lastArea) {
      setOverrideArea(null);
      setLastArea(area);
    }
  }, [area, lastArea]);

  const params = useParams() as { courseId?: string };

  const renderPane = () => {
    switch (resolvedArea) {
      case 'course':
        return <CoursePane courseSlug={params.courseId ?? ''} />;
      case 'default':
      default:
        return <DefaultPane />;
    }
  };

  const contextValue = { isOpen, setIsOpen, overrideArea, setOverrideArea };

  return (
    <SideNavContext.Provider value={contextValue}>
      <div className="min-h-screen md:grid md:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        {/* Backdrop */}
        <div
          className={cn(
            'fixed left-0 top-0 z-10 h-dvh w-screen transition-[background-color,backdrop-filter] md:sticky md:z-20 md:w-full md:bg-transparent',
            isOpen ? 'bg-black/20 backdrop-blur-sm' : 'bg-transparent max-md:pointer-events-none',
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          {/* Sidebar */}
          <SidebarChrome isOpen={isOpen}>{renderPane()}</SidebarChrome>
        </div>

        {/* Main Content */}
        <div className="bg-neutral-100 md:pt-1.5">
          <div className="relative min-h-full bg-neutral-100 pt-px md:rounded-tl-2xl md:border md:border-b-0 md:border-r-0 md:border-neutral-200/80 md:bg-white">
            {children}
          </div>
        </div>
      </div>
    </SideNavContext.Provider>
  );
} 