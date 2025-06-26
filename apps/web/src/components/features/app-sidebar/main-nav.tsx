'use client';

import { cn } from '@/lib/shared/utils/cn';
import { usePathname } from 'next/navigation';
import { createContext, useEffect, useState } from 'react';
import type { ComponentType, Dispatch, SetStateAction, ReactNode } from 'react';
import { useIsMobile } from '@/lib/client/hooks/use-is-mobile';
import { useScrollLock } from '@/lib/client/hooks/use-scroll-lock';

type SideNavContext = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const SideNavContext = createContext<SideNavContext>({
  isOpen: false,
  setIsOpen: () => {},
});

interface MainNavProps {
  children: ReactNode;
  sidebar: ComponentType<{
    slug?: string;
    currentPath?: string;
    toolContent?: ReactNode;
    newsContent?: ReactNode;
    bottom?: ReactNode;
  }>;
  toolContent?: ReactNode;
  newsContent?: ReactNode;
  bottom?: ReactNode;
}

export function MainNav({
  children,
  sidebar: Sidebar,
  toolContent,
  newsContent,
  bottom,
}: MainNavProps) {
  const pathname = usePathname();
  
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when side nav is open on mobile
  useScrollLock(isOpen && isMobile);

  // Close side nav when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      {/* Backdrop for mobile */}
      <div
        className={cn(
          'fixed left-0 top-0 z-10 h-dvh w-screen transition-[background-color,backdrop-filter] md:sticky md:z-20 md:w-full md:bg-transparent',
          isOpen
            ? 'bg-black/20 backdrop-blur-sm'
            : 'bg-transparent max-md:pointer-events-none',
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.stopPropagation();
            setIsOpen(false);
          }
        }}
      >
        {/* Sidebar */}
        <div
          className={cn(
            'relative h-full w-[240px] max-w-full bg-neutral-100 transition-transform md:translate-x-0',
            !isOpen && '-translate-x-full',
          )}
          style={{ zIndex: 30 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={cn(
                'pointer-events-none absolute -left-2/3 bottom-0 aspect-square w-[140%] translate-y-1/4 rounded-full opacity-15 blur-[75px]',
                'bg-[conic-gradient(from_32deg_at_center,#855AFC_0deg,#3A8BFD_72deg,#00FFF9_144deg,#5CFF80_198deg,#EAB308_261deg,#f00_360deg)]',
              )}
            />
          </div>
          <Sidebar 
            toolContent={toolContent} 
            newsContent={newsContent}
            bottom={bottom}
          />
        </div>
      </div>
      
      {/* Main content area */}
      <div className="bg-neutral-100 md:pt-1.5">
        <div className="relative min-h-full bg-neutral-100 pt-px md:rounded-tl-2xl md:border md:border-b-0 md:border-r-0 md:border-neutral-200/80 md:bg-white">
          <SideNavContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
          </SideNavContext.Provider>
        </div>
      </div>
    </div>
  );
} 