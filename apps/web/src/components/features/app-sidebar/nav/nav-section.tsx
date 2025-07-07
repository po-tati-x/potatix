'use client';

import type { NavSection as INavSection } from '../config/static-nav';
import { NavItem } from './nav-item';
import { memo } from 'react';

const NavSectionComponent = ({ section }: { section: INavSection }) => {
  return (
    <div className="flex flex-col gap-0.5">
      {section.name && (
        <div className="mb-2 pl-1 text-sm font-semibold text-slate-700">
          {section.name}
        </div>
      )}
      {section.items.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  );
};

export const NavSection = memo(NavSectionComponent); 