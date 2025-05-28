'use client';

import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationConfig } from './sidebar-navigation';
import { SidebarHeader, SidebarSection } from './sidebar-components';

interface SidebarProps {
  slug: string;
  toolContent?: ReactNode;
  newsContent?: ReactNode;
  bottom?: ReactNode;
}

export function Sidebar({ slug, toolContent, newsContent, bottom }: SidebarProps) {
  const config = useNavigationConfig(slug);
  const showNewsContent = !config.title && newsContent;

  return (
    <div className="scrollbar-hide relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden">
      <nav className="relative flex grow flex-col p-3 text-neutral-800">
        <SidebarHeader 
          title={config.title}
          backHref={config.backHref}
          toolContent={toolContent}
        />

        <div className="flex flex-col gap-4 pt-4">
          {config.sections.map((section, index) => (
            <SidebarSection key={index} section={section} />
          ))}
        </div>

        <AnimatePresence>
          {showNewsContent && (
            <motion.div
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
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {bottom && (
        <div className="relative flex flex-col justify-end">
          {bottom}
        </div>
      )}
    </div>
  );
}