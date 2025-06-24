import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { DashboardPayload } from '@/lib/client/providers/dashboard-context';

import { auth } from '@/lib/auth/auth-server';
import { dashboardService } from '@/lib/server/services/dashboard';

import { DashboardClient } from './client';

export default async function DashboardPage() {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session || !session.user) {
    // Not authenticated – boot the user back to login
    redirect('/login');
  }

  // Fetch the full dashboard payload in parallel on the server
  const rawData = await dashboardService.getAllDashboardData(session.user.id);

  const normalized: DashboardPayload = {
    ...rawData,
    revenueData: rawData.revenueData ?? undefined,
  };

  return <DashboardClient initialData={normalized} />;
}
