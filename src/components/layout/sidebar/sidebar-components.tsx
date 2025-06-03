'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { NavItem, NavSection, useNavItemActive } from './sidebar-navigation';

// Sidebar header component
interface SidebarHeaderProps {
  title?: string;
  backHref?: string;
  toolContent?: ReactNode;
}

export function SidebarHeader({ title, backHref, toolContent }: SidebarHeaderProps) {
  return (
    <div className="relative flex items-center justify-between gap-1 pb-3">
      <Link
        href={backHref || '/'}
        className={cn(
          'rounded-md px-1 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-black/50',
          'flex items-center h-8'
        )}
      >
        {title && backHref ? (
          <div className="group flex items-center gap-2 text-sm font-medium text-slate-800">
            <ChevronLeft className="size-4 text-slate-600 transition-transform duration-100 group-hover:-translate-x-0.5" />
            {title}
          </div>
        ) : (
          <Image
            src="/potatix-isolated.svg"
            alt="Potatix"
            width={87.2}
            height={15.2}
            className="h-6 w-auto"
            priority
          />
        )}
      </Link>

      <div className="flex items-center gap-3 h-8">
        {toolContent}
        <div className="h-8 w-8 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

// Sidebar section component
interface SidebarSectionProps {
  section: NavSection;
}

export function SidebarSection({ section }: SidebarSectionProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {section.name && (
        <div className="mb-2 pl-1 text-sm font-semibold text-slate-700">
          {section.name}
        </div>
      )}
      {section.items.map((item) => (
        <SidebarItem key={item.name} item={item} />
      ))}
    </div>
  );
}

// Main sidebar item component
interface SidebarItemProps {
  item: NavItem;
}

export function SidebarItem({ item }: SidebarItemProps) {
  const { name, href, icon: Icon, exact, items } = item;
  const isActive = useNavItemActive(href, exact);

  return (
    <div>
      <Link
        href={href}
        data-active={isActive}
        className={cn(
          'group flex items-center gap-2.5 rounded-md p-2 text-sm leading-none text-slate-600 transition-[background-color,color,font-weight] duration-75 hover:bg-slate-200/50 active:bg-slate-200/80',
          'outline-none focus-visible:ring-2 focus-visible:ring-black/50',
          isActive &&
            !items &&
            'bg-emerald-100/50 font-medium text-emerald-600 hover:bg-emerald-100/80 active:bg-emerald-100'
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              'size-4 text-slate-500 transition-colors duration-75',
              !items && isActive && 'text-emerald-600'
            )}
          />
        )}
        <span className="font-medium">{name}</span>
        {items && (
          <div className="flex grow justify-end">
            <ChevronDown className="size-3.5 text-slate-500 transition-transform duration-75 group-data-[active=true]:rotate-180" />
          </div>
        )}
      </Link>

      {items && (
        <SidebarSubMenu items={items} isParentActive={isActive} />
      )}
    </div>
  );
}

// Submenu component
interface SidebarSubMenuProps {
  items: Omit<NavItem, 'icon'>[];
  isParentActive: boolean;
}

export function SidebarSubMenu({ items, isParentActive }: SidebarSubMenuProps) {
  return (
    <div
      className={cn(
        'transition-all duration-200 overflow-hidden',
        isParentActive ? 'max-h-96' : 'max-h-0 opacity-0'
      )}
      aria-hidden={!isParentActive}
    >
      <div className="pl-px pt-1">
        <div className="pl-3.5">
          <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-2">
            {items.map((subItem) => (
              <SidebarSubItem key={subItem.name} item={subItem} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-item component
interface SidebarSubItemProps {
  item: Omit<NavItem, 'icon'>;
}

export function SidebarSubItem({ item }: SidebarSubItemProps) {
  const { name, href, exact } = item;
  const isActive = useNavItemActive(href, exact);

  return (
    <Link
      href={href}
      data-active={isActive}
      className={cn(
        'group flex items-center gap-2.5 rounded-md p-2 text-sm leading-none text-slate-600 transition-[background-color,color,font-weight] duration-75 hover:bg-slate-200/50 active:bg-slate-200/80',
        'outline-none focus-visible:ring-2 focus-visible:ring-black/50',
        isActive &&
          'bg-emerald-100/50 font-medium text-emerald-600 hover:bg-emerald-100/80 active:bg-emerald-100'
      )}
    >
      <span className="font-medium">{name}</span>
    </Link>
  );
}