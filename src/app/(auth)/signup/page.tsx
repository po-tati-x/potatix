'use client';

import { useSearchParams } from 'next/navigation';
import AuthForm from '@/components/features/auth/AuthForm';
import SocialLogin from '@/components/features/auth/SocialLogin';
import { Suspense } from 'react';

function SignupContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  return (
    <div className="w-full">
      <AuthForm isLoginMode={false} callbackUrl={callbackUrl} />
      
      <SocialLogin callbackUrl={callbackUrl} />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full flex items-center justify-center py-8">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
} 