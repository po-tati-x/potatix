'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, UserCircle } from 'lucide-react';
import { cn } from '@/lib/shared/utils/cn';
import { useNavigationConfig } from './sidebar-navigation';
import type { NavItem, NavSection } from './sidebar-navigation';
import { useProfile } from '@/lib/client/hooks/use-profile';
import dynamic from 'next/dynamic';

const AnimatePresence = dynamic(
  () => import('framer-motion').then((m) => ({ default: m.AnimatePresence })),
  { ssr: false },
);

const MotionDiv = dynamic(
  () => import('framer-motion').then((m) => ({ default: m.motion.div })),
  { ssr: false },
);

interface SidebarProps {
  slug: string;
  currentPath: string;
  toolContent?: ReactNode;
  newsContent?: ReactNode;
  bottom?: ReactNode;
}

export function Sidebar({ slug, currentPath, toolContent, newsContent, bottom }: SidebarProps) {
  const config = useNavigationConfig(slug);
  const showNewsContent = !config.title && newsContent;
  const { profile } = useProfile();

  return (
    <div className="scrollbar-hide relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden">
      <nav role="navigation" className="relative flex grow flex-col p-3 text-slate-800">
        {/* Header */}
        <div className="relative flex items-center justify-between gap-1 pb-3">
          <Link
            href={config.backHref || '/'}
            className={cn(
              'rounded-md px-1 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-black/50',
              'flex items-center h-8'
            )}
          >
            {config.title && config.backHref ? (
              <div className="group flex items-center gap-2 text-sm font-medium text-slate-800">
                <ChevronLeft className="size-4 text-slate-600 transition-transform duration-100 group-hover:-translate-x-0.5" />
                {config.title}
              </div>
            ) : (
              <Image
                src="https://storage.potatix.com/potatix/images/potatix-isolated.svg"
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
            <Link 
              href="/settings" 
              className="group block h-8 w-8 rounded-full overflow-hidden border border-slate-200 transition-all hover:border-slate-300"
            >
              {profile?.image ? (
                <Image 
                  src={profile.image} 
                  alt="Profile"
                  width={32}
                  height={32}
                  sizes="32px"
                  loading="lazy"
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                  <UserCircle className="size-5 text-slate-400" />
                </div>
              )}
              <span className="sr-only">Your profile</span>
            </Link>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex flex-col gap-4 pt-4">
          {config.sections.map((section) => (
            <SidebarSection key={section.id} section={section} currentPath={currentPath} />
          ))}
        </div>

        {/* News Content (if available) */}
        <AnimatePresence>
          {showNewsContent && (
            <MotionDiv
              className="-mx-3 flex grow flex-col justify-end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.1,
                ease: 'easeInOut',
              }}
            >
              {newsContent}
            </MotionDiv>
          )}
        </AnimatePresence>
      </nav>

      {/* Bottom Content */}
      {bottom && (
        <div className="relative flex flex-col justify-end">
          {bottom}
        </div>
      )}
    </div>
  );
}

// Sidebar Section component
function SidebarSection({ section, currentPath }: { section: NavSection; currentPath: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      {section.name && (
        <div className="mb-2 pl-1 text-sm font-semibold text-slate-700">
          {section.name}
        </div>
      )}
      {section.items.map((item) => (
        <NavItemRenderer key={item.href} item={item} currentPath={currentPath} />
      ))}
    </div>
  );
}

// Navigation Item Renderer
function NavItemRenderer({ item, currentPath }: { item: NavItem; currentPath: string }) {
  const { name, href, icon: Icon, exact, items } = item;
  const submenuId = items ? `${href.replace(/\//g, '-')}-submenu` : undefined;
  
  const isActive = exact ? currentPath === href : currentPath.startsWith(href);

  return (
    <div>
      <Link
        href={href}
        data-active={isActive}
        aria-current={isActive && !items ? 'page' : undefined}
        aria-expanded={items ? isActive : undefined}
        aria-controls={items ? submenuId : undefined}
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
            <svg
              className={cn(
                'size-3.5 text-slate-500 transition-transform duration-75',
                isActive && 'rotate-180'
              )}
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        )}
      </Link>

      {/* Submenu */}
      {items && (
        <div
          id={submenuId}
          className={cn(
            'transition-all duration-200 overflow-hidden',
            isActive ? 'max-h-96' : 'max-h-0 opacity-0'
          )}
          aria-hidden={!isActive}
        >
          <div className="pl-px pt-1">
            <div className="pl-3.5">
              <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-2">
                {items.map((subItem) => (
                  <SubNavItem key={subItem.href} item={subItem} currentPath={currentPath} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub Navigation Item
function SubNavItem({ item, currentPath }: { item: Omit<NavItem, 'icon'>; currentPath: string }) {
  const { name, href, exact } = item;
  const isActive = exact ? currentPath === href : currentPath.startsWith(href);

  return (
    <Link
      href={href}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
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