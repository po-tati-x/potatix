'use client';

import { NavSection } from '../nav/nav-section';
import { useStaticNav } from '../hooks';
import { NewsWidget } from '../utility';
import { SidebarHeader } from '../chrome/sidebar-header';

export function DefaultPane() {
  const sections = useStaticNav();

  return (
    <div className="scrollbar-hide relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden">
      <nav role="navigation" className="relative flex grow flex-col p-3 text-slate-800">
        <SidebarHeader variant="logo" />

        {/* Navigation Sections */}
        <div className="flex flex-col gap-4 pt-4">
          {sections.map((section) => (
            <NavSection key={section.id} section={section} />
          ))}
        </div>

        {/* News */}
        <div className="mt-auto">
          <NewsWidget />
        </div>
      </nav>
    </div>
  );
} 