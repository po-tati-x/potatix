import type { Metadata } from 'next';
import AuthShell from '@/components/features/auth/auth-shell';

export const metadata: Metadata = {
  title: 'Authentication | Potatix',
  description: 'Sign in or create an account on Potatix, the platform for developers to sell technical courses with no monthly fees.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
} 