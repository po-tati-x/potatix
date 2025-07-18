import { Suspense, type ReactNode } from 'react';
import { SidebarRoot } from '@/components/features/app-sidebar/sidebar-root';

export function generateMetadata() {
  return {
    title: 'Dashboard - Potatix',
    description: 'Manage your courses, students, and revenue',
  };
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <Suspense fallback={undefined}>
      <SidebarRoot>
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">{children}</div>
        </main>
      </SidebarRoot>
    </Suspense>
  );
} 