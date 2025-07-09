'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  const area = useNavigationArea();
  const [overrideArea, setOverrideArea] = useState<SidebarArea | null>(null);
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

  const contextValue = { overrideArea, setOverrideArea };

  return (
    <SideNavContext.Provider value={contextValue}>
      <div className="grid min-h-screen grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        {/* Sidebar */}
        <SidebarChrome>{renderPane()}</SidebarChrome>

        {/* Main Content */}
        <div className="bg-neutral-100 pt-2">
          <div className="relative min-h-full bg-neutral-100 pt-px md:rounded-tl-2xl md:border md:border-b-0 md:border-r-0 md:border-neutral-200/80 md:bg-white">
            {children}
          </div>
        </div>
      </div>
    </SideNavContext.Provider>
  );
} 