import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth-server';
import { profileService } from '@/lib/server/services/profile';
import SettingsClient from '@/components/features/settings/settings-client';

export default async function SettingsPage() {
  const hdr = await headers();
  const session = await auth.api.getSession({ headers: hdr });
  if (!session?.user) redirect('/login');

  const profile = await profileService.getUserProfile(session.user.id);

  return <SettingsClient initialData={profile} />;
}
