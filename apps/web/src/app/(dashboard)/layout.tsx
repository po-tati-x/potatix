import { ReactNode } from 'react';
import { AppSidebar } from '@/components/features/app-sidebar/app-sidebar';
import { MainNav } from '@/components/features/app-sidebar/main-nav';

export async function generateMetadata() {
  return {
    title: 'Dashboard - Potatix',
    description: 'Manage your courses, students, and revenue',
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <div className="min-h-screen w-full bg-white">
      <MainNav sidebar={AppSidebar}>
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">{children}</div>
        </main>
      </MainNav>
    </div>
  );
} 