'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebarNav } from '@/components/ui/layout/app-sidebar-nav';
import { MainNav } from '@/components/ui/layout/main-nav';
import { HelpButton } from '@/components/ui/layout/help-button';
import { ReferButton } from '@/components/ui/layout/refer-button';
import { NewsComponent } from '@/components/ui/layout/news-component';
import { useSession, signOut } from '@/lib/auth-client';

export const dynamic = "force-static";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [isPending, session, router]);

  if (!session && !isPending) return null;

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