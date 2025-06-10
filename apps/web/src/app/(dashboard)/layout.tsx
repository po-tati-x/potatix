'use client';

import { AppSidebar } from '@/components/features/app-sidebar/app-sidebar';
import { MainNav } from '@/components/features/app-sidebar/main-nav';

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
          sidebar={AppSidebar}
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