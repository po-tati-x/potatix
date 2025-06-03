'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import AuthForm from '@/components/features/auth/auth-form';
import SocialLogin from '@/components/features/auth/social-login';
import { Suspense, useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          // User is already logged in, redirect to dashboard
          console.log('[Auth] User already authenticated, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Failed to check authentication status:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    
    checkAuth();
  }, [router]);
  
  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="h-5 w-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
        <span className="ml-2 text-sm text-slate-500">Checking login status...</span>
      </div>
    );
  }
  
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