'use client';

import { NavSection } from '../nav/nav-section';
import { useStaticNav } from '../hooks';
import { SidebarHeader } from '../chrome/sidebar-header';
import { PaneShell } from './pane-shell';

export function DefaultPane() {
  const sections = useStaticNav();

  return (
    <nav role="navigation" className="relative h-full p-3 text-slate-800">
      <PaneShell header={<SidebarHeader variant="logo" />}>
        <div className="flex flex-col gap-4 pt-4">
          {sections.map((section) => (
            <NavSection key={section.id} section={section} />
          ))}
        </div>
      </PaneShell>
    </nav>
  );
} 