'use client';

import type { ReactNode } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { HelpButton, ReferButton, NewsComponent } from './utility-buttons';

interface AppSidebarProps {
  toolContent?: ReactNode;
  bottom?: ReactNode;
}

export function AppSidebar({ toolContent, bottom }: AppSidebarProps) {
  const { slug } = useParams() as { slug?: string };
  const workspaceSlug = slug || 'dashboard';
  const currentPath = usePathname();
  
  // Default tool content if none provided
  const defaultToolContent = (
    <div className="flex items-center gap-1">
      <HelpButton />
      <ReferButton />
    </div>
  );

  return (
    <Sidebar
      slug={workspaceSlug}
      currentPath={currentPath}
      toolContent={toolContent || defaultToolContent}
      newsContent={<NewsComponent />}
      bottom={bottom}
    />
  );
} 