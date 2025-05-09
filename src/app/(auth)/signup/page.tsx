'use client';

import { useSearchParams } from 'next/navigation';
import AuthForm from '@/components/features/auth/AuthForm';
import SocialLogin from '@/components/features/auth/SocialLogin';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  return (
    <div className="w-full">
      <AuthForm isLoginMode={false} callbackUrl={callbackUrl} />
      
      <SocialLogin callbackUrl={callbackUrl} />
    </div>
  );
} 