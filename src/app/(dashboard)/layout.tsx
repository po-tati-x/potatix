'use client';

import { AppSidebarNav } from '@/components/layout/sidebar/app-sidebar-nav';
import { MainNav } from '@/components/layout/sidebar/main-nav';
import { HelpButton } from '@/components/layout/sidebar/help-button';
import { ReferButton } from '@/components/layout/sidebar/refer-button';
import { NewsComponent } from '@/components/layout/sidebar/news-component';

export const dynamic = "force-static";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No session fetching or checks - middleware already handles this
  
  return (
    <>
      <div className="min-h-screen w-full bg-white">
        <MainNav
          sidebar={AppSidebarNav}
          toolContent={
            <>
              <ReferButton />
              <HelpButton />
            </>
          }
          newsContent={<NewsComponent />}
        >
          <main className="flex-1 overflow-y-auto">
            <div className="container py-6">
              {children}
            </div>
          </main>
        </MainNav>
      </div>
    </>
  );
} 