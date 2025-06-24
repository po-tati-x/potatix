import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import SettingsClient from '@/components/features/settings/settings-client';
import { auth } from '@/lib/auth/auth-server';
import { profileService } from '@/lib/server/services/profile';

export default async function SettingsPage() {
  const hdr = await headers();
  const session = await auth.api.getSession({ headers: hdr });
  if (!session?.user) redirect('/login');

  const profile = await profileService.getUserProfile(session.user.id);

  return <SettingsClient initialData={profile} />;
}
