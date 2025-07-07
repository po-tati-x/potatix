'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/shared/utils/cn';
import { Fragment, useState, memo, useCallback } from 'react';
import type { NavItem as INavItem } from '../config/static-nav';

interface NavItemProps {
  item: INavItem;
  className?: string;
}

function NavItemComponent({ item, className }: NavItemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = `${pathname}${searchParams.toString() ? `?${searchParams}` : ''}`;

  const hasChildren = item.items && item.items.length > 0;
  const storageKey = hasChildren ? `nav:${item.href}:expanded` : undefined;

  // null = no manual override yet. boolean = user-set expanded state
  const [overrideExpanded, setOverrideExpanded] = useState<boolean | null>(() => {
    if (!hasChildren || typeof window === 'undefined' || !storageKey) return null;
    const stored = localStorage.getItem(storageKey);
    return stored === null ? null : stored === '1';
  });

  // Treat full URL (path + query) as the current location
  const isExactActive = item.exact ? current === item.href : current.startsWith(item.href);

  const routeActive =
    isExactActive ||
    (hasChildren && item.items!.some((child) => current.startsWith(child.href)));

  const isExpanded = hasChildren && (overrideExpanded !== null ? overrideExpanded : routeActive);

  const toggleExpand = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setOverrideExpanded((prev) => {
        // When override not set, derive current expanded status then flip
        const currentExpanded = prev === null ? isExpanded : prev;
        const next = !currentExpanded;
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, next ? '1' : '0');
          } catch {
            /* ignore write error - e.g. storage quota exceeded or running in private mode */
          }
        }
        return next;
      });
    },
    [storageKey, isExpanded],
  );

  const Icon = item.icon;
  const submenuId = hasChildren ? `${item.href.replace(/\//g, '-')}-submenu` : undefined;

  // Determine semantic variant for styling
  const variant: 'course' | 'module' | 'lesson' =
    item.variant ?? (hasChildren ? 'module' : 'lesson');

  // Treat module parents as non-navigable collapsibles
  const isModuleParent = hasChildren && variant === 'module';

  // Restructured row styles ‑ highlight active state without nesting interactive elements
  const rowClasses = cn(
    // Base layout
    'group flex items-center gap-2.5 rounded-md p-2 leading-tight transition-all duration-75 outline-none focus-visible:ring-2 focus-visible:ring-black/50',
    // Variant-specific typography / color
    variant === 'course' && 'text-base font-semibold text-slate-800',
    variant === 'module' && 'text-sm font-medium text-slate-700',
    variant === 'lesson' && 'text-sm text-slate-600',
    // Neutral hover/active styles shared by all
    'hover:bg-slate-200/50 active:bg-slate-200/80',
    // Highlight exact active leaf (lesson) route
    !hasChildren &&
      isExactActive &&
      'bg-emerald-100/50 font-medium text-emerald-600 hover:bg-emerald-100/80 active:bg-emerald-100',
    // Highlight module row only when it is the exact active route
    hasChildren && isExactActive && 'bg-emerald-100/40 font-medium text-emerald-700',
    className,
  );

  if (!hasChildren) {
    // Leaf node: Make the whole row the anchor for better UX
    return (
      <Link
        href={item.href}
        data-active={routeActive}
        aria-current={isExactActive ? 'page' : undefined}
        className={cn(rowClasses, 'flex items-center gap-2')}
        onClick={item.onClick}
      >
        {Icon && (
          <Icon
            className={cn(
              'size-4 flex-shrink-0 text-slate-500 transition-colors duration-75',
              isExactActive && 'text-emerald-600',
            )}
          />
        )}
        <span className="truncate font-medium">{item.name}</span>
      </Link>
    );
  }

  // Parent node with children
  return (
    <Fragment>
      {isModuleParent ? (
        // Non-link row behaving as toggle
        <div
          data-active={routeActive}
          className={cn(rowClasses, 'cursor-pointer')}
          onClick={toggleExpand}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleExpand(e);
          }}
          aria-expanded={isExpanded}
          aria-controls={submenuId}
        >
          {Icon && (
            <Icon className="size-4 flex-shrink-0 text-slate-500 transition-colors duration-75" />
          )}
          <span className="truncate font-medium">{item.name}</span>

          <svg
            className={cn(
              'ml-auto size-3.5 text-slate-500 transition-transform duration-75',
              isExpanded && 'rotate-180',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      ) : (
        <div data-active={routeActive} className={rowClasses}>
          <Link
            href={item.href}
            aria-current={isExactActive ? 'page' : undefined}
            className="flex flex-1 items-center gap-2 truncate outline-none"
            onClick={item.onClick}
          >
            {Icon && (
              <Icon className="size-4 flex-shrink-0 text-slate-500 transition-colors duration-75" />
            )}
            <span className="truncate font-medium">{item.name}</span>
          </Link>

          <button
            type="button"
            onClick={toggleExpand}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            aria-expanded={isExpanded}
            aria-controls={submenuId}
            className="ml-auto flex h-5 w-5 items-center justify-center rounded hover:bg-slate-200/70"
          >
            <svg
              className={cn(
                'size-3.5 text-slate-500 transition-transform duration-75',
                isExpanded && 'rotate-180',
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      )}

      <div
        id={submenuId}
        className={cn(
          'overflow-hidden transition-[height] duration-200',
          isExpanded ? 'h-auto' : 'h-0',
        )}
        aria-hidden={!isExpanded}
      >
        {isExpanded && (
          <div className="pl-px pt-1">
            <div className="pl-3.5">
              <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-2">
                {item.items!.map((sub) => (
                  <NavItem key={sub.href} item={sub as INavItem} className="p-2" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}

export const NavItem = memo(NavItemComponent); 