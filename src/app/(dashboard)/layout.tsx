'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebarNav } from '@/components/ui/layout/app-sidebar-nav';
import { MainNav } from '@/components/ui/layout/main-nav';
import { HelpButton } from '@/components/ui/layout/help-button';
import { ReferButton } from '@/components/ui/layout/refer-button';
import { NewsComponent } from '@/components/ui/layout/news-component';
import { authClient } from '@/lib/auth/auth-client';

export const dynamic = "force-static";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await authClient.getSession();
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session:', error);
        // On error, assume no session exists
        router.push('/auth/sign-in');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  // While loading, show nothing to prevent flicker
  if (loading) return null;

  // If no session and not loading, redirect to login
  if (!session && !loading) {
    // This is a safety net - the redirect should happen in the useEffect
    router.push('/auth/sign-in');
    return null;
  }

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